function Field({
  id,
  label,
  value,
  onInput,
  required,
}: {
  id: string;
  label: string;
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
        value={value}
        onInput={onInput}
        required={required}
      />
    </label>
  );
}

export function AddItemForm({
  title,
  setTitle,
  error,
  adding,
  onSubmit,
}: {
  title: string;
  setTitle: (v: string) => void;
  error: string;
  adding: boolean;
  onSubmit: (e: Event) => void;
}) {
  return (
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title">Add Item</h2>
        <form onSubmit={onSubmit}>
          <Field
            id="title"
            label="Title"
            value={title}
            onInput={(e) => setTitle(e.currentTarget.value)}
            required
          />
          {error && (
            <div class="alert alert-error mt-2">
              <span>{error}</span>
            </div>
          )}
          <div class="card-actions mt-4">
            <button type="submit" class="btn btn-primary" disabled={adding}>
              {adding ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
