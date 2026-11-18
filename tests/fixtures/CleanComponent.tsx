export function CleanComponent() {
  return (
    <div>
      <img src="/logo.png" alt="Company logo" />

      <button onClick={() => {}} aria-label="Close dialog">
        <svg aria-hidden="true" width="16" height="16">
          <path d="M0 0 L16 16" />
        </svg>
      </button>

      <label htmlFor="email">Email address</label>
      <input id="email" type="email" />

      <a href="/more">Learn more about our services</a>
    </div>
  );
}
