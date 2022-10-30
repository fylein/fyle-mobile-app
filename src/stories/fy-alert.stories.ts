import { HttpClientModule } from '@angular/common/http';
import { Story, Meta, moduleMetadata } from '@storybook/angular';

import { FyAlertComponent } from 'src/app/shared/components/fy-alert/fy-alert.component';
import { IconModule } from 'src/app/shared/icon/icon.module';

export default {
  title: 'Fy-Alert',
  component: FyAlertComponent,
  decorators: [
    moduleMetadata({
      imports: [HttpClientModule, IconModule],
      declarations: [FyAlertComponent],
    }),
  ],
} as Meta;

const Template: Story<FyAlertComponent> = (args: FyAlertComponent) => ({
  props: args,
});

export const InfoAlert = Template.bind({});
InfoAlert.args = {
  type: 'information',
  message: 'Some dummy message',
};

export const WarningAlert = Template.bind({});
WarningAlert.args = {
  type: 'warning',
  message: 'Some dummy message',
};

export const CardAlert = Template.bind({});
CardAlert.args = {
  type: 'card',
  message: 'Some dummy message',
};
