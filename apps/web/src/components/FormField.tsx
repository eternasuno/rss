import { Show } from 'solid-js';
import type { AnyFieldApi } from '@tanstack/solid-form';

export function FormField(props: {
  field: AnyFieldApi;
  type: string;
  placeholder: string;
}) {
  return (
    <div>
      <input
        type={props.type}
        placeholder={props.placeholder}
        value={props.field.state.value}
        onBlur={props.field.handleBlur}
        onInput={(e) => props.field.handleChange(e.currentTarget.value)}
        required
      />
      <Show when={props.field.state.meta.isTouched && props.field.state.meta.errors.length > 0}>
        <p role="alert">{props.field.state.meta.errors[0]}</p>
      </Show>
    </div>
  );
}
