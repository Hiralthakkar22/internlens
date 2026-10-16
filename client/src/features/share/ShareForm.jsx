import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { IconPlus, IconTrash, IconArrowUp, IconArrowDown, IconCheck } from "@tabler/icons-react";
import CompanyPicker from "./CompanyPicker";
import { useMeta } from "../../hooks/useMeta";
import { useSaveExperience } from "../experiences/queries";
import { EMPTY, thisMonth, toPayload } from "./formValues";

const DRAFT_KEY = "il-share-draft";

const STEPS = [
  { title: "Company and role", fields: ["company", "roleTitle", "roleType", "source", "interviewDate", "workMode", "location"] },
  { title: "Rounds", fields: ["rounds"] },
  { title: "Topics and tips", fields: ["topics", "difficulty", "tips"] },
  { title: "Offer and result", fields: ["stipendStatus", "stipend", "hasBond", "bondMonths", "outcome", "daysToResult"] },
];

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function Field({ label, hint, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{label}</span>
        {children}
      </label>
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs text-coral" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

// a group of radio buttons that look like a segmented switch
function Choice({ name, options, register, rules, error, labels = {} }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {options.map((o) => (
          <label key={o} className="cursor-pointer">
            <input type="radio" value={o} {...register(name, rules)} className="peer sr-only" />
            <span className="inline-block rounded-xl border border-line px-3.5 py-2 text-sm text-muted transition-colors peer-checked:border-mint peer-checked:bg-mint/12 peer-checked:text-mint peer-focus-visible:outline-2 peer-focus-visible:outline-mint hover:text-text">
              {labels[o] ?? o}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-xs text-coral" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default function ShareForm({ initial, experienceId, presetCompany }) {
  const meta = useMeta();
  const navigate = useNavigate();
  const save = useSaveExperience(experienceId);
  const isEdit = Boolean(experienceId);
  const [step, setStep] = useState(0);

  // new post: start from the saved draft (if any) or the company passed from a report card page
  const [startValues] = useState(() => {
    if (initial) return initial;
    const base = readDraft() ?? EMPTY;
    return presetCompany ? { ...base, company: presetCompany } : base;
  });

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: startValues, mode: "onTouched" });

  const rounds = useFieldArray({ control, name: "rounds" });
  const values = watch();

  // keep an unsent draft in this browser, so a refresh doesn't lose a long post
  useEffect(() => {
    if (isEdit) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {
        // storage blocked: no draft, the form still works
      }
    }, 500);
    return () => clearTimeout(id);
  }, [values, isEdit]);

  async function next() {
    const ok = await trigger(STEPS[step].fields);
    if (ok) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function onSubmit(v) {
    try {
      const { experience } = await save.mutateAsync(toPayload(v));
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
      toast.success(isEdit ? "Changes saved" : "Experience shared", {
        description: experience.status === "pending" ? "An admin will review it soon. Only you can see it until then." : undefined,
      });
      navigate(`/experiences/${experience.id}`);
    } catch (err) {
      // show server validation errors next to the right field, and jump to that step
      if (err.details) {
        Object.entries(err.details).forEach(([field, message]) => setError(field, { message }));
        const firstStep = STEPS.findIndex((s) => Object.keys(err.details).some((f) => s.fields.includes(f.split(".")[0])));
        if (firstStep >= 0) setStep(firstStep);
      }
      toast.error(err.message);
    }
  }

  function startOver() {
    if (!window.confirm("Clear the whole form?")) return;
    reset(EMPTY);
    setStep(0);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }

  const last = step === STEPS.length - 1;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        // pressing Enter on an early step should go to the next step, not submit
        if (!last) {
          e.preventDefault();
          next();
        } else handleSubmit(onSubmit)(e);
      }} className="mx-auto max-w-3xl">
      {/* progress: a real sequence, so numbered steps */}
      <ol className="mb-8 grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => setStep(i)}
              className="w-full text-left disabled:cursor-default"
              aria-current={i === step ? "step" : undefined}
            >
              <span className={`block h-1.5 rounded-full ${i <= step ? "bg-mint" : "bg-raised"}`} />
              <span className={`mt-2 flex items-center gap-1.5 text-xs sm:text-sm ${i === step ? "text-text" : "text-muted"}`}>
                {i < step ? <IconCheck size={14} className="text-mint" aria-hidden="true" /> : <span className="num">{i + 1}</span>}
                <span className="hidden sm:inline">{s.title}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-line bg-panel p-5 sm:p-7">
        <h2 className="mb-6 text-xl">{STEPS[step].title}</h2>

        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">Company</span>
              <Controller
                name="company"
                control={control}
                rules={{ validate: (v) => Boolean(v?.name) || "Choose or add the company" }}
                render={({ field }) => <CompanyPicker value={field.value} onChange={field.onChange} invalid={Boolean(errors.company)} />}
              />
              {errors.company && <p className="mt-1 text-xs text-coral" role="alert">{errors.company.message}</p>}
            </div>
            {values.company && !values.company.id && (
              <Field label="Company city" hint="Where is the office you interviewed for?" className="sm:col-span-2">
                <input className="field" placeholder="Surat" {...register("company.city", { maxLength: 60 })} />
              </Field>
            )}
            <Field label="Role title" error={errors.roleTitle}>
              <input
                className="field"
                placeholder="MERN Stack Intern"
                aria-invalid={Boolean(errors.roleTitle)}
                {...register("roleTitle", { required: "Enter the role title", minLength: { value: 2, message: "Too short" } })}
              />
            </Field>
            <Field label="Role type" error={errors.roleType}>
              <select className="field" aria-invalid={Boolean(errors.roleType)} {...register("roleType", { required: "Pick a role type" })}>
                <option value="">Choose</option>
                {meta.ROLE_TYPES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Interview month" error={errors.interviewDate}>
              <input
                type="month"
                max={thisMonth()}
                className="field"
                {...register("interviewDate", {
                  required: "Pick the month",
                  validate: (v) => v <= thisMonth() || "Can't be in the future",
                })}
              />
            </Field>
            <Field label="Office location" hint="Leave empty if same as the company city">
              <input className="field" placeholder="Ahmedabad" {...register("location", { maxLength: 60 })} />
            </Field>
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">How did you apply?</span>
              <Choice name="source" options={meta.SOURCES} register={register} rules={{ required: "Pick one" }} error={errors.source} />
            </div>
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">Work mode</span>
              <Choice name="workMode" options={meta.WORK_MODES} register={register} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="mb-5 text-sm text-muted">Add the rounds in the order they happened. Write what they asked, it helps the next person the most.</p>
            <ol className="space-y-4">
              {rounds.fields.map((f, i) => (
                <li key={f.id} className="rounded-xl border border-line bg-raised/50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num grid size-7 place-items-center rounded-full bg-mint/15 text-sm font-bold text-mint">{i + 1}</span>
                    <select
                      className="field w-auto flex-1"
                      aria-label={`Round ${i + 1} type`}
                      aria-invalid={Boolean(errors.rounds?.[i]?.type)}
                      {...register(`rounds.${i}.type`, { required: "Pick the round type" })}
                    >
                      <option value="">Round type</option>
                      {meta.ROUND_TYPES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                    <div className="flex">
                      <button type="button" disabled={i === 0} onClick={() => rounds.move(i, i - 1)} className="rounded-lg p-2 text-muted hover:bg-panel disabled:opacity-30" aria-label="Move up">
                        <IconArrowUp size={16} />
                      </button>
                      <button type="button" disabled={i === rounds.fields.length - 1} onClick={() => rounds.move(i, i + 1)} className="rounded-lg p-2 text-muted hover:bg-panel disabled:opacity-30" aria-label="Move down">
                        <IconArrowDown size={16} />
                      </button>
                      <button type="button" disabled={rounds.fields.length === 1} onClick={() => rounds.remove(i)} className="rounded-lg p-2 text-muted hover:bg-panel hover:text-coral disabled:opacity-30" aria-label="Remove round">
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                  {errors.rounds?.[i]?.type && <p className="mt-1 text-xs text-coral" role="alert">{errors.rounds[i].type.message}</p>}
                  <textarea
                    rows={3}
                    className="field mt-3"
                    placeholder="What did they ask? How long was it? Was it online or in office?"
                    {...register(`rounds.${i}.details`, { maxLength: { value: 2000, message: "Keep it under 2000 characters" } })}
                  />
                </li>
              ))}
            </ol>
            {rounds.fields.length < 8 && (
              <button type="button" onClick={() => rounds.append({ type: "", details: "" })} className="btn btn-ghost mt-4">
                <IconPlus size={18} aria-hidden="true" /> Add round
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Topics they asked about</legend>
              <p className="mb-3 text-xs text-muted">Pick all that apply, up to 10</p>
              <div className="flex flex-wrap gap-2">
                {meta.TOPICS.map((t) => (
                  <label key={t} className="cursor-pointer">
                    <input
                      type="checkbox"
                      value={t}
                      className="peer sr-only"
                      {...register("topics", { validate: (v) => v.length <= 10 || "Pick up to 10 topics" })}
                    />
                    <span className="inline-block rounded-full border border-line px-3 py-1.5 text-sm text-muted transition-colors peer-checked:border-sky peer-checked:bg-sky/12 peer-checked:text-sky peer-focus-visible:outline-2 peer-focus-visible:outline-sky hover:text-text">
                      {t}
                    </span>
                  </label>
                ))}
              </div>
              {errors.topics && <p className="mt-1 text-xs text-coral" role="alert">{errors.topics.message}</p>}
            </fieldset>
            <div>
              <span className="mb-1.5 block text-sm font-medium">How hard was it overall?</span>
              <Choice name="difficulty" options={meta.DIFFICULTY} register={register} rules={{ required: "Pick one" }} error={errors.difficulty} />
            </div>
            <Field label="Tips for the next student" hint="Optional. What would you do differently?" error={errors.tips}>
              <textarea rows={4} className="field" placeholder="Revise SQL joins, they asked two queries..." {...register("tips", { maxLength: { value: 1500, message: "Keep it under 1500 characters" } })} />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">Stipend</span>
              <Choice
                name="stipendStatus"
                options={["paid", "unpaid", "unknown"]}
                labels={{ paid: "Paid", unpaid: "Unpaid", unknown: "They didn't tell" }}
                register={register}
              />
            </div>
            {values.stipendStatus === "paid" && (
              <Field label="Stipend per month (₹)" error={errors.stipend}>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  className="field num"
                  placeholder="15000"
                  aria-invalid={Boolean(errors.stipend)}
                  {...register("stipend", {
                    required: "Enter the amount",
                    min: { value: 1, message: "Enter the amount" },
                    max: { value: 500000, message: "That looks too high" },
                    shouldUnregister: true, // hidden when "Unpaid" is picked, so its rules must go too
                  })}
                />
              </Field>
            )}
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">Was there a bond or service agreement?</span>
              <Choice name="hasBond" options={["no", "yes"]} labels={{ no: "No bond", yes: "Yes, there was a bond" }} register={register} />
            </div>
            {values.hasBond === "yes" && (
              <Field label="Bond length (months)" error={errors.bondMonths}>
                <input
                  type="number"
                  inputMode="numeric"
                  className="field num"
                  placeholder="24"
                  aria-invalid={Boolean(errors.bondMonths)}
                  {...register("bondMonths", {
                    required: "How many months?",
                    min: { value: 1, message: "At least 1 month" },
                    max: { value: 60, message: "Up to 60 months" },
                    shouldUnregister: true,
                  })}
                />
              </Field>
            )}
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">Result</span>
              <Choice name="outcome" options={meta.OUTCOMES} register={register} rules={{ required: "Pick your result" }} error={errors.outcome} />
            </div>
            <Field label="Days until you got the result" hint="Optional. From the last round to the mail." error={errors.daysToResult}>
              <input
                type="number"
                inputMode="numeric"
                className="field num"
                placeholder="10"
                {...register("daysToResult", { min: { value: 0, message: "Can't be negative" }, max: { value: 365, message: "Up to 365 days" } })}
              />
            </Field>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 sm:col-span-2">
              <input type="checkbox" className="mt-1 size-4 accent-[var(--mint)]" {...register("anonymous")} />
              <span>
                <span className="block text-sm font-medium">Post anonymously</span>
                <span className="block text-xs text-muted">Your name and college will be hidden from everyone.</span>
              </span>
            </label>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
                Back
              </button>
            )}
            {!isEdit && step === 0 && (
              <button type="button" className="btn text-sm text-muted hover:text-coral" onClick={startOver}>
                Clear form
              </button>
            )}
          </div>
          {last ? (
            <button type="submit" className="btn btn-primary" disabled={save.isPending}>
              {save.isPending ? "Saving..." : isEdit ? "Save changes" : "Share experience"}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={next}>
              Next
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
