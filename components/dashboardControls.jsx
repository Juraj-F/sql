import {
  Show,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

export default function DashboardControls() {
  return (
    <div className="auth-controls">
      <Show when="signed-out">
        <SignInButton>
          <button type="button" className="btn">
            Sign in
          </button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}