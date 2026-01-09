"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useResearcherProfile } from "@/hooks/useResearcherProfile";

interface FormData {
  full_name: string;
  institution: string;
  department: string;
  professional_email: string;
  credentials_url: string;
  bio: string;
}

interface FormErrors {
  full_name?: string;
  institution?: string;
  professional_email?: string;
}

export default function ResearcherProfilePage() {
  const router = useRouter();
  const { address, role, isLoading: authLoading } = useAuth();
  const { createProfile, isCreating, hasProfile } =
    useResearcherProfile(address);

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    institution: "",
    department: "",
    professional_email: "",
    credentials_url: "",
    bio: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!address || role !== "researcher") {
      router.push("/connect");
      return;
    }
  }, [address, role, authLoading, router]);

  const handleChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.institution.trim()) {
      newErrors.institution = "Institution is required";
    }

    if (!formData.professional_email.trim()) {
      newErrors.professional_email = "Professional email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.professional_email)
    ) {
      newErrors.professional_email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm() || !address) return;

    try {
      const isNewProfile = !hasProfile;
      await createProfile({
        ...formData,
        wallet_address: address,
      });

      if (isNewProfile) {
        setFormData({
          full_name: "",
          institution: "",
          department: "",
          professional_email: "",
          credentials_url: "",
          bio: "",
        });
        toast.success("Profile created successfully!");
        router.push("/shared");
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save profile"
      );
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          {hasProfile && (
            <Link
              href="/shared"
              className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center text-sm transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
          )}
          <CardTitle>
            {hasProfile ? "Researcher Profile" : "Complete Your Profile"}
          </CardTitle>
          <CardDescription>
            {hasProfile
              ? "View and update your professional information."
              : "As a researcher, please provide your professional information to access shared records."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={handleChange("full_name")}
                  placeholder="Dr. Jane Smith"
                  aria-required="true"
                  aria-invalid={!!errors.full_name}
                  aria-describedby={
                    errors.full_name ? "full_name-error" : undefined
                  }
                  disabled={isCreating}
                />
                {errors.full_name && (
                  <p
                    id="full_name-error"
                    role="alert"
                    className="text-destructive text-sm"
                  >
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution *</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={handleChange("institution")}
                  placeholder="Harvard Medical School"
                  aria-required="true"
                  aria-invalid={!!errors.institution}
                  aria-describedby={
                    errors.institution ? "institution-error" : undefined
                  }
                  disabled={isCreating}
                />
                {errors.institution && (
                  <p
                    id="institution-error"
                    role="alert"
                    className="text-destructive text-sm"
                  >
                    {errors.institution}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={handleChange("department")}
                  placeholder="Oncology Research"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="professional_email">Professional Email *</Label>
                <Input
                  id="professional_email"
                  type="email"
                  value={formData.professional_email}
                  onChange={handleChange("professional_email")}
                  placeholder="jane.smith@institution.edu"
                  aria-required="true"
                  aria-invalid={!!errors.professional_email}
                  aria-describedby={
                    errors.professional_email
                      ? "professional_email-error"
                      : undefined
                  }
                  disabled={isCreating}
                />
                {errors.professional_email && (
                  <p
                    id="professional_email-error"
                    role="alert"
                    className="text-destructive text-sm"
                  >
                    {errors.professional_email}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="credentials_url">Credentials URL</Label>
                <Input
                  id="credentials_url"
                  value={formData.credentials_url}
                  onChange={handleChange("credentials_url")}
                  placeholder="https://orcid.org/0000-0000-0000-0000"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={handleChange("bio")}
                  placeholder="Brief description of your research focus"
                  disabled={isCreating}
                  rows={3}
                />
              </div>
            </div>

            {submitError && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                {submitError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreating
                ? hasProfile
                  ? "Updating Profile..."
                  : "Creating Profile..."
                : hasProfile
                  ? "Update Profile"
                  : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
