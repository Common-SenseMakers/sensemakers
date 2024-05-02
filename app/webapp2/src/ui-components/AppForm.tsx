import { Form, FormField, FormFieldExtendedProps } from 'grommet';
import { ReactNode } from 'react';

export const AppForm = Form;

export interface IAppFormField extends FormFieldExtendedProps {
  help?: string | ReactNode;
}

export const AppFormField = (props: IAppFormField) => {
  return <FormField {...props}>{props.children}</FormField>;
};
