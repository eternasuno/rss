function Field({
  id,
  label,
  type,
  value,
  onInput,
  required,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onInput: (e: Event & { currentTarget: HTMLInputElement }) => void;
  required?: boolean;
}) {
  return (
    <label class="form-control" for={id}>
      <span class="label-text">{label}</span>
      <input
        id={id}
        class="input input-bordered"
        type={type}
        value={value}
        onInput={onInput}
        required={required}
      />
    </label>
  );
}

function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div class="alert alert-error mt-2">
      <span>{message}</span>
    </div>
  );
}

export function CreateFeedForm({
  title,
  setTitle,
  description,
  setDescription,
  link,
  setLink,
  error,
  creating,
  onSubmit,
}: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  link: string;
  setLink: (v: string) => void;
  error: string;
  creating: boolean;
  onSubmit: (e: Event) => void;
}) {
  return (
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title">Create Feed</h2>
        <form onSubmit={onSubmit}>
          <Field
            id="title"
            label="Title"
            type="text"
            value={title}
            onInput={(e) => setTitle(e.currentTarget.value)}
            required
          />
          <Field
            id="description"
            label="Description"
            type="text"
            value={description}
            onInput={(e) => setDescription(e.currentTarget.value)}
            required
          />
          <Field
            id="link"
            label="Link (URL)"
            type="url"
            value={link}
            onInput={(e) => setLink(e.currentTarget.value)}
            required
          />
          <ErrorAlert message={error} />
          <div class="card-actions mt-4">
            <button type="submit" class="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Feed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
