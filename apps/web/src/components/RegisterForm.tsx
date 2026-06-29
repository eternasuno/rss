import { Navigate, useSearchParams } from '@solidjs/router';
import { createForm } from '@tanstack/solid-form';
import { type Accessor, createSignal, Show } from 'solid-js';
import { signUp } from '../lib/auth-client';
import { AuthCard } from './AuthCard';
import { FormField } from './FormField';
import { SubmitButton } from './SubmitButton';

// biome-ignore lint/suspicious/noExplicitAny: @tanstack/solid-form field/props types require many generics
type RegisterFormProps = { form: any; submitError: Accessor<string> };

// biome-ignore lint/suspicious/noExplicitAny: @tanstack/solid-form callback types require many generics
type RegisterFieldCb = any;

// biome-ignore lint/suspicious/noExplicitAny: @tanstack/solid-form subscribe types require many generics
type RegisterSubCb = any;

function makeSubmitHandler(params: {
  redirectTo: () => string;
  setRedirectUrl: ReturnType<typeof createSignal<string | null>>[1];
  setSubmitError: ReturnType<typeof createSignal<string>>[1];
}) {
  return async ({ value }: { value: { name: string; email: string; password: string } }) => {
    params.setSubmitError('');
    const { error } = await signUp.email(value);

    if (error) {
      params.setSubmitError(error.message ?? '注册失败');
      return;
    }
    params.setRedirectUrl(params.redirectTo());
  };
}

function NameField(props: RegisterFormProps) {
  return (
    <props.form.Field name="name">
      {(field: RegisterFieldCb) => (
        <FormField field={field()} type="text" placeholder="请输入昵称" label="昵称" />
      )}
    </props.form.Field>
  );
}

function EmailField(props: RegisterFormProps) {
  return (
    <props.form.Field name="email">
      {(field: RegisterFieldCb) => (
        <FormField field={field()} type="email" placeholder="请输入邮箱" label="邮箱" />
      )}
    </props.form.Field>
  );
}

function PasswordField(props: RegisterFormProps) {
  return (
    <props.form.Field name="password">
      {(field: RegisterFieldCb) => (
        <FormField field={field()} type="password" placeholder="请输入密码" label="密码" />
      )}
    </props.form.Field>
  );
}

function SubmitArea(props: RegisterFormProps) {
  return (
    <>
      <props.form.Subscribe
        selector={(s: RegisterSubCb) => ({
          canSubmit: s.canSubmit,
          isSubmitting: s.isSubmitting,
        })}
      >
        {(state: RegisterSubCb) => (
          <SubmitButton
            canSubmit={state().canSubmit}
            isSubmitting={state().isSubmitting}
            label="注册"
            loadingLabel="注册中..."
          />
        )}
      </props.form.Subscribe>
      {props.submitError() && (
        <div role="alert" class="alert alert-error mt-4">
          <span>{props.submitError()}</span>
        </div>
      )}
    </>
  );
}

function RegisterFormContent(props: RegisterFormProps) {
  return (
    <AuthCard
      title="注册"
      subtitle="创建一个新账户开始使用"
      footerLink="/login"
      footerText="已有账户？"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.form.handleSubmit();
        }}
      >
        <NameField form={props.form} submitError={props.submitError} />
        <EmailField form={props.form} submitError={props.submitError} />
        <PasswordField form={props.form} submitError={props.submitError} />
        <SubmitArea form={props.form} submitError={props.submitError} />
      </form>
    </AuthCard>
  );
}

export function RegisterForm() {
  const [searchParams] = useSearchParams();
  const [redirectUrl, setRedirectUrl] = createSignal<string | null>(null);
  const [submitError, setSubmitError] = createSignal('');

  const redirectTo = () => {
    const r = searchParams.redirect;
    return typeof r === 'string' ? r : '/';
  };

  const form = createForm(() => ({
    defaultValues: { email: '', name: '', password: '' },
    onSubmit: makeSubmitHandler({ redirectTo, setRedirectUrl, setSubmitError }),
  }));

  return (
    <>
      <Show when={redirectUrl()}>{(url) => <Navigate href={url()} />}</Show>
      <RegisterFormContent form={form} submitError={submitError} />
    </>
  );
}
