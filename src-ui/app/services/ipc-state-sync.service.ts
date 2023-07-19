import { Injectable } from '@angular/core';
import { SleepService } from './sleep.service';
import { VRChatService } from './vrchat.service';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  startWith,
} from 'rxjs';
import { cloneDeep, isEqual } from 'lodash';
import { UserStatus } from 'vrchat';
import { IPCService } from './ipc.service';
import { AutomationConfigService } from './automation-config.service';
import {
  OyasumiSidecarAutomationsState_AutoAcceptInviteRequests_Mode,
  OyasumiSidecarState,
  VrcStatus,
} from '../../../src-grpc-web-client/overlay-sidecar_pb';
import { AutomationConfigs } from '../models/automations';
import { TranslateService } from '@ngx-translate/core';
import { SLEEPING_ANIMATION_PRESETS } from '../models/sleeping-animation-presets';
import { AppSettingsService } from './app-settings.service';
import {
  ShutdownAutomationsService,
  ShutdownSequenceStageOrder,
} from './shutdown-automations.service';

@Injectable({
  providedIn: 'root',
})
export class IPCStateSyncService {
  private state = new BehaviorSubject<OyasumiSidecarState>({
    sleepMode: false,
    vrcStatus: VrcStatus.Offline,
    vrcUsername: '',
    automations: {
      autoAcceptInviteRequests: {
        enabled: false,
        mode: OyasumiSidecarAutomationsState_AutoAcceptInviteRequests_Mode.Whitelist,
        playerCount: 0,
      },
      changeStatusBasedOnPlayerCount: {
        enabled: false,
        threshold: 1,
      },
      sleepingAnimations: {
        enabled: false,
        presetName: '',
      },
      shutdownAutomations: {
        sleepTriggerEnabled: false,
        timeDelay: 1000 * 60 * 30,
        running: false,
        canStart: false,
      },
    },
  });

  constructor(
    private sleepService: SleepService,
    private vrchatService: VRChatService,
    private ipcService: IPCService,
    private automationConfig: AutomationConfigService,
    private translate: TranslateService,
    private appSettings: AppSettingsService,
    private shutdownAutomationsService: ShutdownAutomationsService
  ) {}

  async init() {
    // Sync state to overlay sidecar
    combineLatest([this.state, this.ipcService.overlaySidecarClient])
      .pipe(filter(([, client]) => !!client))
      .subscribe(([state, client]) => {
        client!.syncState(state);
      });
    // Update state when sleep mode changes
    this.sleepService.mode.subscribe((sleepMode) => {
      this.state.next({ ...cloneDeep(this.state.value), sleepMode });
    });
    // Update the state when the VRChat user or their status changes.
    this.vrchatService.user.subscribe((user) => {
      this.state.next({
        ...cloneDeep(this.state.value),
        vrcUsername: user?.displayName ?? '',
        vrcStatus: this.mapVRCStatus(user?.status),
      });
    });
    // Update the state when the locale changes
    this.appSettings.settings
      .pipe(
        map((settings) => settings.userLanguage),
        distinctUntilChanged()
      )
      .subscribe((locale) => {
        this.state.next({
          ...cloneDeep(this.state.value),
          locale,
        });
      });
    // Update the state when the automation configs change
    this.automationConfig.configs
      .pipe(
        map((configs) => ({ ...configs })),
        startWith({} as AutomationConfigs),
        pairwise(),
        filter(([oldConfigs, newConfigs]) => {
          const configIds: Array<keyof AutomationConfigs> = [
            'AUTO_ACCEPT_INVITE_REQUESTS',
            'CHANGE_STATUS_BASED_ON_PLAYER_COUNT',
            'SLEEPING_ANIMATIONS',
            'SHUTDOWN_AUTOMATIONS',
          ];
          return configIds.some((configId) => !isEqual(oldConfigs[configId], newConfigs[configId]));
        }),
        map(([, configs]) => configs)
      )
      .subscribe((configs) => {
        const state = cloneDeep(this.state.value);
        {
          const automation = state.automations!.autoAcceptInviteRequests!;
          automation.enabled = configs.AUTO_ACCEPT_INVITE_REQUESTS.enabled;
          automation.mode = this.mapAutoAcceptInviteRequestsListMode(
            configs.AUTO_ACCEPT_INVITE_REQUESTS.listMode
          );
          automation.playerCount = configs.AUTO_ACCEPT_INVITE_REQUESTS.playerIds.length;
        }
        {
          const automation = state.automations!.changeStatusBasedOnPlayerCount!;
          automation.enabled = configs.CHANGE_STATUS_BASED_ON_PLAYER_COUNT.enabled;
          automation.threshold = configs.CHANGE_STATUS_BASED_ON_PLAYER_COUNT.limit;
        }
        {
          const automation = state.automations!.sleepingAnimations!;
          automation.enabled = configs.SLEEPING_ANIMATIONS.enabled;
          if (
            configs.SLEEPING_ANIMATIONS.preset &&
            configs.SLEEPING_ANIMATIONS.preset !== 'CUSTOM'
          ) {
            const preset = SLEEPING_ANIMATION_PRESETS.find(
              (p) => p.id === configs.SLEEPING_ANIMATIONS.preset
            );
            automation.presetName = preset ? preset.name + ' ' + preset.versions : 'Unknown Preset';
          } else {
            automation.presetName = '';
          }
        }
        {
          const automation = state.automations!.shutdownAutomations!;
          automation.sleepTriggerEnabled = configs.SHUTDOWN_AUTOMATIONS.triggerOnSleep;
          automation.timeDelay = configs.SHUTDOWN_AUTOMATIONS.sleepDuration;
          automation.canStart =
            this.shutdownAutomationsService.getApplicableStages(configs.SHUTDOWN_AUTOMATIONS)
              .length > 0;
        }
        this.state.next(state);
      });
    // Update the state when the shutdown automations state changes
    this.shutdownAutomationsService.stage.subscribe((stage) => {
      const index = ShutdownSequenceStageOrder.indexOf(stage);
      const active = index > 0;
      const state = cloneDeep(this.state.value);
      if (state.automations?.shutdownAutomations?.running !== active) {
        const automation = state.automations!.shutdownAutomations!;
        automation.running = active;
        this.state.next(state);
      }
    });
  }

  private mapVRCStatus(vrcStatus: UserStatus | undefined): VrcStatus {
    switch (vrcStatus) {
      case UserStatus.JoinMe:
        return VrcStatus.JoinMe;
      case UserStatus.Active:
        return VrcStatus.Active;
      case UserStatus.AskMe:
        return VrcStatus.AskMe;
      case UserStatus.Busy:
        return VrcStatus.Busy;
      default:
        return VrcStatus.Offline;
    }
  }

  private mapAutoAcceptInviteRequestsListMode(
    mode: 'DISABLED' | 'WHITELIST' | 'BLACKLIST'
  ): OyasumiSidecarAutomationsState_AutoAcceptInviteRequests_Mode {
    switch (mode) {
      case 'DISABLED':
        return OyasumiSidecarAutomationsState_AutoAcceptInviteRequests_Mode.Disabled;
      case 'WHITELIST':
        return OyasumiSidecarAutomationsState_AutoAcceptInviteRequests_Mode.Whitelist;
      case 'BLACKLIST':
        return OyasumiSidecarAutomationsState_AutoAcceptInviteRequests_Mode.Blacklist;
    }
  }
}
