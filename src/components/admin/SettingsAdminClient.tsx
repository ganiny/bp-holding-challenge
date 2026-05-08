"use client";

import { useState, useTransition } from "react";
import {
  useForm,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  IconLoader2,
  IconEye,
  IconEyeOff,
  IconUserCircle,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ImageKitImage } from "@/components/imagekit/ImageKitImage";
import {
  ImageKitUploader,
  type UploadResult,
} from "@/components/imagekit/ImageKitUploader";
import {
  adminProfileUpdateSchema,
  adminPasswordChangeSchema,
} from "@/lib/validation/adminProfile";
import {
  updateAdminProfile,
  changeAdminPassword,
} from "@/app/[locale]/admin/settings/actions";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export type SettingsAdminCopy = {
  tabProfile: string;
  tabPassword: string;
  // Profile
  profileTitle: string;
  profileSubtitle: string;
  profileEmail: string;
  profileEmailHint: string;
  profileFullName: string;
  profileFullNamePlaceholder: string;
  profilePhone: string;
  profilePhonePlaceholder: string;
  profileAvatar: string;
  profileAvatarHint: string;
  profileAvatarReplace: string;
  profileAvatarRemove: string;
  profileSave: string;
  profileSaving: string;
  profileSuccess: string;
  profileErrorValidation: string;
  profileErrorUnauthorized: string;
  profileErrorGeneric: string;
  // Password
  passwordTitle: string;
  passwordSubtitle: string;
  passwordCurrent: string;
  passwordCurrentPlaceholder: string;
  passwordNew: string;
  passwordNewPlaceholder: string;
  passwordConfirm: string;
  passwordConfirmPlaceholder: string;
  passwordShow: string;
  passwordHide: string;
  passwordSubmit: string;
  passwordSubmitting: string;
  passwordRuleMin: string;
  passwordRuleLower: string;
  passwordRuleUpper: string;
  passwordRuleDigit: string;
  passwordSuccess: string;
  passwordErrorInvalidCurrent: string;
  passwordErrorMismatch: string;
  passwordErrorSameAsCurrent: string;
  passwordErrorValidation: string;
  passwordErrorUnauthorized: string;
  passwordErrorGeneric: string;
};

export function SettingsAdminClient({
  profile,
  locale,
  copy,
}: {
  profile: Profile;
  locale: "ar" | "en";
  copy: SettingsAdminCopy;
}) {
  return (
    <Tabs defaultValue="profile" dir={locale === 'en' ? 'ltr' : 'rtl'}>
      <TabsList className="flex flex-wrap gap-1 bg-muted/50">
        <TabsTrigger value="profile">{copy.tabProfile}</TabsTrigger>
        <TabsTrigger value="password">{copy.tabPassword}</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <ProfileForm initial={profile} locale={locale} copy={copy} />
      </TabsContent>
      <TabsContent value="password" className="mt-6">
        <PasswordForm copy={copy} />
      </TabsContent>
    </Tabs>
  );
}

type ProfileFormValues = {
  full_name: string;
  phone: string;
  avatar_url: string;
};

function ProfileForm({
  initial,
  locale,
  copy,
}: {
  initial: Profile;
  locale: "ar" | "en";
  copy: SettingsAdminCopy;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: (
      zodResolver as unknown as (s: unknown) => Resolver<ProfileFormValues>
    )(adminProfileUpdateSchema),
    defaultValues: {
      full_name: initial.full_name ?? "",
      phone: initial.phone ?? "",
      avatar_url: initial.avatar_url ?? "",
    },
  });

  const avatarPath = watch("avatar_url");

  const onSubmit: SubmitHandler<ProfileFormValues> = (values) => {
    startTransition(async () => {
      const res = await updateAdminProfile(
        {
          full_name: values.full_name,
          phone: values.phone,
          avatar_url: values.avatar_url === "" ? null : values.avatar_url,
        },
        locale,
      );
      if (res.ok) toast.success(copy.profileSuccess);
      else if (res.code === "validation")
        toast.error(copy.profileErrorValidation);
      else if (res.code === "unauthorized")
        toast.error(copy.profileErrorUnauthorized);
      else toast.error(copy.profileErrorGeneric);
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-border bg-card p-5 space-y-5"
      noValidate
    >
      <div>
        <h2 className="text-sm font-semibold tracking-tight">
          {copy.profileTitle}
        </h2>
        <p className="text-xs text-muted-foreground">{copy.profileSubtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>{copy.profileEmail}</Label>
          <Input value={initial.email} dir="ltr" disabled readOnly className="mt-2" />
          <p className="mt-1 text-xs text-muted-foreground">
            {copy.profileEmailHint}
          </p>
        </div>
        <div>
          <Label htmlFor="settings-name">{copy.profileFullName}</Label>
          <Input
            id="settings-name"
            placeholder={copy.profileFullNamePlaceholder}
            {...register("full_name")}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="settings-phone">{copy.profilePhone}</Label>
          <Input
            id="settings-phone"
            dir="ltr"
            placeholder={copy.profilePhonePlaceholder}
            {...register("phone")}
            className="mt-2"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label>{copy.profileAvatar}</Label>
          <p className="text-xs text-muted-foreground">
            {copy.profileAvatarHint}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative size-16 overflow-hidden rounded-full bg-muted ring-2 ring-border">
            {avatarPath ? (
              <ImageKitImage
                src={avatarPath}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <IconUserCircle className="size-10" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ImageKitUploader
              folder="/private/employees"
              accept="image/*"
              maxSizeMB={5}
              label={
                avatarPath
                  ? copy.profileAvatarReplace
                  : copy.profileAvatarHint
              }
              onUploaded={(results: UploadResult[]) => {
                const r = results[0];
                if (r) setValue("avatar_url", r.filePath);
              }}
            />
            {avatarPath ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue("avatar_url", "")}
              >
                {copy.profileAvatarRemove}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              {copy.profileSaving}
            </>
          ) : (
            copy.profileSave
          )}
        </Button>
      </div>
    </form>
  );
}

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function PasswordForm({ copy }: { copy: SettingsAdminCopy }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: (
      zodResolver as unknown as (s: unknown) => Resolver<PasswordFormValues>
    )(adminPasswordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<PasswordFormValues> = (values) => {
    startTransition(async () => {
      const res = await changeAdminPassword(values);
      if (res.ok) {
        toast.success(copy.passwordSuccess);
        reset({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else if (res.code === "invalid_current") {
        toast.error(copy.passwordErrorInvalidCurrent);
      } else if (res.code === "validation") {
        if (res.reason === "mismatch")
          toast.error(copy.passwordErrorMismatch);
        else if (res.reason === "same_as_current")
          toast.error(copy.passwordErrorSameAsCurrent);
        else toast.error(copy.passwordErrorValidation);
      } else if (res.code === "unauthorized") {
        toast.error(copy.passwordErrorUnauthorized);
      } else {
        toast.error(copy.passwordErrorGeneric);
      }
    });
  };

  const inputType = showPassword ? "text" : "password";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-border bg-card p-5 space-y-5"
      noValidate
    >
      <div>
        <h2 className="text-sm font-semibold tracking-tight">
          {copy.passwordTitle}
        </h2>
        <p className="text-xs text-muted-foreground">{copy.passwordSubtitle}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="settings-current-pw">{copy.passwordCurrent}</Label>
          <div className="relative">
            <Input
              id="settings-current-pw"
              type={inputType}
              autoComplete="current-password"
              dir="ltr"
              placeholder={copy.passwordCurrentPlaceholder}
              {...register("currentPassword")}
              className="mt-2"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 inset-e-2 my-auto inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? copy.passwordHide : copy.passwordShow}
            >
              {showPassword ? (
                <IconEyeOff className="size-4" />
              ) : (
                <IconEye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="settings-new-pw">{copy.passwordNew}</Label>
          <Input
            id="settings-new-pw"
            type={inputType}
            autoComplete="new-password"
            dir="ltr"
            placeholder={copy.passwordNewPlaceholder}
            {...register("newPassword")}
            className="mt-2"
          />
          <ul className="mt-2 grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:grid-cols-2">
            <li>{copy.passwordRuleMin}</li>
            <li>{copy.passwordRuleLower}</li>
            <li>{copy.passwordRuleUpper}</li>
            <li>{copy.passwordRuleDigit}</li>
          </ul>
          {errors.newPassword ? (
            <p className="mt-1 text-xs text-destructive">
              {copy.passwordErrorValidation}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="settings-confirm-pw">{copy.passwordConfirm}</Label>
          <Input
            id="settings-confirm-pw"
            type={inputType}
            autoComplete="new-password"
            dir="ltr"
            placeholder={copy.passwordConfirmPlaceholder}
            {...register("confirmPassword")}
            className="mt-2"
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-xs text-destructive">
              {copy.passwordErrorMismatch}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              {copy.passwordSubmitting}
            </>
          ) : (
            copy.passwordSubmit
          )}
        </Button>
      </div>
    </form>
  );
}
