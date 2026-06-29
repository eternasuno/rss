export function SubmitButton(props: {
  canSubmit: boolean;
  isSubmitting: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button type="submit" disabled={!props.canSubmit} class="btn btn-primary w-full mt-4">
      {props.isSubmitting ? (
        <>
          <span class="loading loading-spinner loading-sm" />
          {props.loadingLabel}
        </>
      ) : (
        props.label
      )}
    </button>
  );
}
