"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteTeamMemberAction,
  toggleTeamMemberAction
} from "@/app/admin/actions";
import type { AdminTeamMember } from "@/lib/admin/data";
import TeamMemberForm from "./TeamMemberForm";

export default function TeamMemberRowActions({
  member
}: {
  member: AdminTeamMember;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  const onToggle = () => {
    startTransition(async () => {
      const res = await toggleTeamMemberAction(member.id, !member.is_active);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(member.is_active ? "Hidden" : "Shown");
        router.refresh();
      }
    });
  };

  const onDelete = () => {
    if (
      !confirm(
        `"${member.name}" ke delete korte chan? Eta permanent.`
      )
    )
      return;
    startTransition(async () => {
      const res = await deleteTeamMemberAction(member.id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Deleted");
        router.refresh();
      }
    });
  };

  if (editing) {
    return (
      <div className="w-full mt-2">
        <TeamMemberForm member={member} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        onClick={() => setEditing(true)}
        className="grid place-items-center h-8 w-8 rounded-full bg-white border border-mango-200 hover:bg-mango-50"
        aria-label="Edit"
      >
        <Edit className="h-3.5 w-3.5 text-mango-700" />
      </button>
      <button
        onClick={onToggle}
        disabled={pending}
        className="grid place-items-center h-8 w-8 rounded-full bg-white border border-mango-200 hover:bg-mango-50 disabled:opacity-50"
        aria-label={member.is_active ? "Hide" : "Show"}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : member.is_active ? (
          <EyeOff className="h-3.5 w-3.5 text-ink" />
        ) : (
          <Eye className="h-3.5 w-3.5 text-leaf-600" />
        )}
      </button>
      <button
        onClick={onDelete}
        disabled={pending}
        className="grid place-items-center h-8 w-8 rounded-full bg-white border-2 border-red-200 hover:bg-red-50 disabled:opacity-50"
        aria-label="Delete"
      >
        <Trash2 className="h-3.5 w-3.5 text-red-600" />
      </button>
    </div>
  );
}
