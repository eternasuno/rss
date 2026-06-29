import type { AnyFieldApi } from '@tanstack/solid-form';
import { Show } from 'solid-js';
import { cn } from '../lib/cn';

export function FormField(props: {
  field: AnyFieldApi;
  type: string;
  placeholder: string;
  label?: string;
}) {
  const hasError = () =>
    props.field.state.meta.isTouched && props.field.state.meta.errors.length > 0;

  return (
    <fieldset class="fieldset">
      <Show when={props.label}>
        <legend class="fieldset-legend">{props.label}</legend>
      </Show>
      <input
        type={props.type}
        placeholder={props.placeholder}
        value={props.field.state.value}
        onBlur={props.field.handleBlur}
        onInput={(e) => props.field.handleChange(e.currentTarget.value)}
        required
        class={cn('input w-full', hasError() && 'input-error')}
      />
      <Show when={hasError()}>
        <p class="fieldset-label text-error" role="alert">
          {props.field.state.meta.errors[0]}
        </p>
      </Show>
    </fieldset>
  );
}
