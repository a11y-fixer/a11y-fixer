export function BrokenComponent() {
  return (
    <div>
      {/* 1.1.1: missing alt */}
      <img src="/logo.png" />

      {/* 4.1.2: button has no accessible name */}
      <button onClick={() => {}}>
        <svg aria-hidden="true" width="16" height="16">
          <path d="M0 0 L16 16" />
        </svg>
      </button>

      {/* 1.3.1: input missing label */}
      <input type="email" placeholder="Enter email" />

      {/* 2.4.4: generic link text */}
      <a href="/more">click here</a>
    </div>
  );
}
