import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ThemeService } from './services/theme.service';
import { DashboardViewComponent } from './views/dashboard-view/dashboard-view.component';
import { BatteryAutomationsViewComponent } from './views/dashboard-view/views/battery-automations-view/battery-automations-view.component';
import { SettingsViewComponent } from './views/dashboard-view/views/settings-view/settings-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VarDirective } from './directives/var.directive';
import { AboutViewComponent } from './views/dashboard-view/views/about-view/about-view.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { OverviewViewComponent } from './views/dashboard-view/views/overview-view/overview-view.component';
import { SleepDetectionViewComponent } from './views/dashboard-view/views/sleep-detection-view/sleep-detection-view.component';
import {
  DefaultSimpleModalOptionConfig,
  defaultSimpleModalOptions,
  SimpleModalModule,
} from 'ngx-simple-modal';
import { TimeEnableSleepModeModalComponent } from './views/dashboard-view/views/sleep-detection-view/time-enable-sleepmode-modal/time-enable-sleep-mode-modal.component';
import { TimeDisableSleepModeModalComponent } from './views/dashboard-view/views/sleep-detection-view/time-disable-sleepmode-modal/time-disable-sleep-mode-modal.component';
import { BatteryPercentageEnableSleepModeModalComponent } from './views/dashboard-view/views/sleep-detection-view/battery-percentage-enable-sleepmode-modal/battery-percentage-enable-sleep-mode-modal.component';
import { DevicePowerOnDisableSleepModeModalComponent } from './views/dashboard-view/views/sleep-detection-view/device-poweron-disable-sleepmode-modal/device-power-on-disable-sleep-mode-modal.component';
import { SleepModeEnableOnControllersPoweredOffAutomationService } from './services/sleep-detection-automations/sleep-mode-enable-on-controllers-powered-off-automation.service';
import { SleepModeEnableAtBatteryPercentageAutomationService } from './services/sleep-detection-automations/sleep-mode-enable-at-battery-percentage-automation.service';
import { SleepModeEnableAtTimeAutomationService } from './services/sleep-detection-automations/sleep-mode-enable-at-time-automation.service';
import { SleepModeDisableAtTimeAutomationService } from './services/sleep-detection-automations/sleep-mode-disable-at-time-automation.service';
import { SleepModeDisableOnDevicePowerOnAutomationService } from './services/sleep-detection-automations/sleep-mode-disable-on-device-power-on-automation.service';
import { TurnOffDevicesWhenChargingAutomationService } from './services/battery-automations/turn-off-devices-when-charging-automation.service';
import { TurnOffDevicesOnSleepModeEnableAutomationService } from './services/battery-automations/turn-off-devices-on-sleep-mode-enable-automation.service';
import { NVMLService } from './services/nvml.service';
import { OpenVRService } from './services/openvr.service';
import { GpuAutomationsViewComponent } from './views/dashboard-view/views/gpu-automations-view/gpu-automations-view.component';
import { WindowsService } from './services/windows.service';
import { SleepService } from './services/sleep.service';
import { GpuAutomationsService } from './services/gpu-automations.service';
import { PowerLimitInputComponent } from './views/dashboard-view/views/gpu-automations-view/power-limit-input/power-limit-input.component';
import { NgPipesModule } from 'ngx-pipes';
import { SleepingPoseViewerComponent } from './components/sleeping-pose-viewer/sleeping-pose-viewer.component';
import { OscService } from './services/osc.service';
import { OscAutomationsViewComponent } from './views/dashboard-view/views/osc-automations-view/osc-automations-view.component';
import { SelectBoxComponent } from './components/select-box/select-box.component';
import { TStringTranslatePipePipe } from './pipes/tstring-translate.pipe';
import { OscScriptButtonComponent } from './components/osc-script-button/osc-script-button.component';
import { OscScriptModalComponent } from './components/osc-script-modal/osc-script-modal.component';
import { OscScriptCodeEditorComponent } from './components/osc-script-code-editor/osc-script-code-editor.component';
import { DropdownButtonComponent } from './components/dropdown-button/dropdown-button.component';
import { OscScriptSimpleEditorComponent } from './components/osc-script-simple-editor/osc-script-simple-editor.component';
import { DashboardNavbarComponent } from './components/dashboard-navbar/dashboard-navbar.component';
import { DeviceListComponent } from './components/device-list/device-list.component';
import { DeviceListItemComponent } from './components/device-list-item/device-list-item.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardViewComponent,
    BatteryAutomationsViewComponent,
    SettingsViewComponent,
    DashboardNavbarComponent,
    DeviceListComponent,
    DeviceListItemComponent,
    VarDirective,
    AboutViewComponent,
    OverviewViewComponent,
    SleepDetectionViewComponent,
    TimeEnableSleepModeModalComponent,
    TimeDisableSleepModeModalComponent,
    BatteryPercentageEnableSleepModeModalComponent,
    DevicePowerOnDisableSleepModeModalComponent,
    GpuAutomationsViewComponent,
    PowerLimitInputComponent,
    SleepingPoseViewerComponent,
    OscAutomationsViewComponent,
    SelectBoxComponent,
    TStringTranslatePipePipe,
    OscScriptButtonComponent,
    OscScriptModalComponent,
    OscScriptCodeEditorComponent,
    DropdownButtonComponent,
    OscScriptSimpleEditorComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    NgPipesModule,
    SimpleModalModule,
  ],
  providers: [
    ThemeService,
    {
      provide: DefaultSimpleModalOptionConfig,
      useValue: {
        ...defaultSimpleModalOptions,
        ...{
          closeOnEscape: true,
          closeOnClickOutside: false,
          wrapperDefaultClasses: 'modal-wrapper',
          animationDuration: '150',
        },
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    private openvr: OpenVRService,
    private nvml: NVMLService,
    private windows: WindowsService,
    private sleep: SleepService,
    private osc: OscService,
    // GPU automations
    private gpuAutomations: GpuAutomationsService,
    // Sleep mode automations
    private sleepModeEnableOnControllersPoweredOffAutomation: SleepModeEnableOnControllersPoweredOffAutomationService,
    private sleepModeEnableAtBatteryPercentageAutomation: SleepModeEnableAtBatteryPercentageAutomationService,
    private sleepModeEnableAtTimeAutomationService: SleepModeEnableAtTimeAutomationService,
    private sleepModeDisableAtTimeAutomationService: SleepModeDisableAtTimeAutomationService,
    private sleepModeDisableOnDevicePowerOnAutomationService: SleepModeDisableOnDevicePowerOnAutomationService,
    // Battery automations
    private turnOffDevicesOnSleepModeEnableAutomationService: TurnOffDevicesOnSleepModeEnableAutomationService,
    private turnOffDevicesWhenChargingAutomationService: TurnOffDevicesWhenChargingAutomationService
  ) {
    this.init();
  }

  async init() {
    await Promise.all([await this.openvr.init(), await this.windows.init(), await this.osc.init()]);
    await this.nvml.init();
    await this.sleep.init();
    // GPU automations
    await this.gpuAutomations.init();
    // Sleep mode automations
    await Promise.all([
      this.sleepModeEnableOnControllersPoweredOffAutomation.init(),
      this.sleepModeEnableAtBatteryPercentageAutomation.init(),
      this.sleepModeEnableAtTimeAutomationService.init(),
      this.sleepModeDisableAtTimeAutomationService.init(),
      this.sleepModeDisableOnDevicePowerOnAutomationService.init(),
    ]);
    // Battery automations
    await Promise.all([
      this.turnOffDevicesOnSleepModeEnableAutomationService.init(),
      this.turnOffDevicesWhenChargingAutomationService.init(),
    ]);
  }
}
