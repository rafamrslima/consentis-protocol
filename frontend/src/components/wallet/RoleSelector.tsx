"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserRole } from "@/types";

interface RoleSelectorProps {
  onSelect: (role: UserRole) => void;
  isLoading?: boolean;
}

const roles: { value: UserRole; title: string; description: string }[] = [
  {
    value: "patient",
    title: "Patient",
    description:
      "Upload and manage your medical records. Grant or revoke access to researchers.",
  },
  {
    value: "researcher",
    title: "Researcher",
    description:
      "Access shared medical records for research purposes with patient consent.",
  },
];

export function RoleSelector({ onSelect, isLoading }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleConfirm = () => {
    if (selectedRole) {
      onSelect(selectedRole);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Select Your Role</h2>
        <p className="text-muted-foreground mt-2">
          Choose how you want to use Consentis Protocol
        </p>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <Card
            key={role.value}
            className={`cursor-pointer transition-colors ${
              selectedRole === role.value
                ? "border-primary ring-2 ring-primary/20"
                : "hover:border-muted-foreground/50"
            }`}
            onClick={() => setSelectedRole(role.value)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{role.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{role.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleConfirm}
        disabled={!selectedRole || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? "Confirming..." : "Continue"}
      </Button>
    </div>
  );
}
