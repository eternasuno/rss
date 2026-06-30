import { createForm } from '@tanstack/solid-form';
import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { createSignal, Show } from 'solid-js';
import { FormField } from './FormField';
import { SubmitButton } from './SubmitButton';

export function CreateFeedForm() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = createSignal(false);
  const [submitError, setSubmitError] = createSignal('');

  const mutation = createMutation(() => ({
    mutationFn: async (value: { title: string; description: string; link: string }) => {
      const res = await fetch('/api/feeds', {
        body: JSON.stringify(value),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '创建失败' }));
        throw new Error(err.error || '创建失败');
      }
      return res.json();
    },
    onError: (err: Error) => {
      setSubmitError(err.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      setShowForm(false);
      setSubmitError('');
    },
  }));

  const form = createForm(() => ({
    defaultValues: { description: '', link: '', title: '' },
    onSubmit: async ({ value }) => {
      setSubmitError('');
      await mutation.mutateAsync(value);
    },
  }));

  return (
    <div class="mb-6">
      <button onClick={() => setShowForm(!showForm())} type="button" class="btn btn-primary">
        {showForm() ? '取消' : '创建 Feed'}
      </button>

      <Show when={showForm()}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          class="mt-4 space-y-2"
        >
          <form.Field name="title">
            {(field) => (
              <FormField field={field()} type="text" placeholder="输入标题" label="标题" />
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <FormField field={field()} type="text" placeholder="输入描述" label="描述" />
            )}
          </form.Field>
          <form.Field name="link">
            {(field) => (
              <FormField field={field()} type="url" placeholder="输入链接" label="链接" />
            )}
          </form.Field>

          <form.Subscribe
            selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}
          >
            {(state) => (
              <SubmitButton
                canSubmit={state().canSubmit}
                isSubmitting={state().isSubmitting}
                label="创建"
                loadingLabel="创建中..."
              />
            )}
          </form.Subscribe>

          <Show when={submitError()}>
            <div role="alert" class="alert alert-error mt-4">
              <span>{submitError()}</span>
            </div>
          </Show>
        </form>
      </Show>
    </div>
  );
}
