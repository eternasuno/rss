import { Navigate, useSearchParams } from '@solidjs/router';
import { createForm } from '@tanstack/solid-form';
import { type Accessor, createSignal, Show } from 'solid-js';
import { signIn } from '../lib/auth-client';
import { AuthCard } from './AuthCard';
import { FormField } from './FormField';
import { SubmitButton } from './SubmitButton';

// biome-ignore lint/suspicious/noExplicitAny: @tanstack/solid-form field/props types require many generics
type LoginFormProps = { form: any; submitError: Accessor<string> };

// biome-ignore lint/suspicious/noExplicitAny: @tanstack/solid-form callback types require many generics
type LoginFieldCb = any;

// biome-ignore lint/suspicious/noExplicitAny: @tanstack/solid-form subscribe types require many generics
type LoginSubCb = any;

function makeSubmitHandler(params: {
  setSubmitError: ReturnType<typeof createSignal<string>>[1];
  redirectTo: () => string;
  setRedirectUrl: ReturnType<typeof createSignal<string | null>>[1];
}) {
  return async ({ value }: { value: { email: string; password: string } }) => {
    params.setSubmitError('');
    const { error } = await signIn.email({ email: value.email, password: value.password });

    if (error) {
      params.setSubmitError(error.message ?? '登录失败');
      return;
    }
    params.setRedirectUrl(params.redirectTo());
  };
}

function EmailField(props: LoginFormProps) {
  return (
    <props.form.Field name="email">
      {(field: LoginFieldCb) => (
        <FormField field={field()} type="email" placeholder="请输入邮箱" label="邮箱" />
      )}
    </props.form.Field>
  );
}

function PasswordField(props: LoginFormProps) {
  return (
    <props.form.Field name="password">
      {(field: LoginFieldCb) => (
        <FormField field={field()} type="password" placeholder="请输入密码" label="密码" />
      )}
    </props.form.Field>
  );
}

function SubmitArea(props: LoginFormProps) {
  return (
    <>
      <props.form.Subscribe
        selector={(s: LoginSubCb) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}
      >
        {(state: LoginSubCb) => (
          <SubmitButton
            canSubmit={state().canSubmit}
            isSubmitting={state().isSubmitting}
            label="登录"
            loadingLabel="登录中..."
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

function LoginFormContent(props: LoginFormProps) {
  return (
    <AuthCard
      title="登录"
      subtitle="登录你的账户以继续使用"
      footerLink="/register"
      footerText="还没有账户？"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.form.handleSubmit();
        }}
      >
        <EmailField form={props.form} submitError={props.submitError} />
        <PasswordField form={props.form} submitError={props.submitError} />
        <SubmitArea form={props.form} submitError={props.submitError} />
      </form>
    </AuthCard>
  );
}

export function LoginForm() {
  const [searchParams] = useSearchParams();
  const [submitError, setSubmitError] = createSignal('');
  const [redirectUrl, setRedirectUrl] = createSignal<string | null>(null);

  const redirectTo = () => {
    const r = searchParams.redirect;
    return typeof r === 'string' ? r : '/';
  };

  const form = createForm(() => ({
    defaultValues: { email: '', password: '' },
    onSubmit: makeSubmitHandler({ redirectTo, setRedirectUrl, setSubmitError }),
  }));

  return (
    <>
      <Show when={redirectUrl()}>{(url) => <Navigate href={url()} />}</Show>
      <LoginFormContent form={form} submitError={submitError} />
    </>
  );
}
