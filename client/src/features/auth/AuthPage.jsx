import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { IconCurrencyRupee, IconLockOpen, IconTarget, IconLock } from "@tabler/icons-react";
import { useLogin, useRegister, useUser } from "../../hooks/useAuth";

// A small preview of what the app tells you, shown beside the form on big screens
function Preview() {
  const rows = [
    { icon: IconCurrencyRupee, cls: "text-mint", text: "Pays ₹26,000, 57% above average" },
    { icon: IconLockOpen, cls: "text-mint", text: "Nobody reported a bond" },
    { icon: IconLock, cls: "text-coral", text: "Bond for 83% of students (24 months)" },
    { icon: IconTarget, cls: "text-amber", text: "Hard interviews, about 1 in 4 got selected" },
  ];
  return (
    <div className="hidden rounded-3xl border border-line bg-panel p-8 lg:block">
      <p className="text-lg font-semibold">Know these before you say yes to an offer.</p>
      <ul className="mt-6 space-y-3">
        {rows.map(({ icon: Icon, cls, text }) => (
          <li key={text} className="flex items-center gap-3 rounded-xl bg-raised px-4 py-3 text-sm font-medium">
            <Icon size={20} className={cls} aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted">Every report card is built from experiences students shared after their interviews.</p>
    </div>
  );
}

function Input({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input className="field" aria-invalid={Boolean(error)} {...props} />
      {error && (
        <span className="mt-1 block text-xs text-coral" role="alert">
          {error.message}
        </span>
      )}
    </label>
  );
}

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { user } = useUser();
  const login = useLogin();
  const registerUser = useRegister();
  const navigate = useNavigate();
  const location = useLocation();
  const goTo = location.state?.from || "/";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  if (user) return <Navigate to={goTo} replace />;

  async function onSubmit(values) {
    try {
      const { user: u } = isLogin ? await login.mutateAsync(values) : await registerUser.mutateAsync(values);
      toast.success(isLogin ? `Welcome back, ${u.name.split(" ")[0]}` : "Account created");
      navigate(goTo, { replace: true });
    } catch (err) {
      if (err.details) Object.entries(err.details).forEach(([f, message]) => setError(f, { message }));
      else setError("root", { message: err.message });
    }
  }

  return (
    <div className="grid items-center gap-10 py-4 lg:grid-cols-2 lg:py-10">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl">{isLogin ? "Log in" : "Create your account"}</h1>
        <p className="mt-2 text-muted">
          {isLogin ? "Save experiences, upvote helpful ones and share your own." : "Free. You can still post without your name."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4">
          {!isLogin && (
            <Input
              label="Full name"
              autoComplete="name"
              placeholder="Riya Shah"
              error={errors.name}
              {...register("name", { required: "Enter your name", minLength: { value: 2, message: "Name is too short" } })}
            />
          )}
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="riya@college.edu"
            error={errors.email}
            {...register("email", {
              required: "Enter your email",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
            })}
          />
          <Input
            label="Password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder={isLogin ? "Your password" : "At least 8 characters, with a number"}
            error={errors.password}
            {...register(
              "password",
              isLogin
                ? { required: "Enter your password" }
                : {
                    required: "Choose a password",
                    minLength: { value: 8, message: "At least 8 characters" },
                    validate: (v) => (/[A-Za-z]/.test(v) && /\d/.test(v)) || "Use letters and at least one number",
                  }
            )}
          />
          {!isLogin && (
            <Input label="College (optional)" placeholder="VNSGU, Surat" error={errors.college} {...register("college", { maxLength: 100 })} />
          )}

          {errors.root && (
            <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral" role="alert">
              {errors.root.message}
            </p>
          )}

          <button type="submit" className="btn btn-primary w-full py-3" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isLogin ? "New here? " : "Already have an account? "}
          <Link to={isLogin ? "/register" : "/login"} state={location.state} className="font-medium text-mint hover:underline">
            {isLogin ? "Create an account" : "Log in"}
          </Link>
        </p>
      </div>
      <Preview />
    </div>
  );
}
