import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmModalProps {
    onConfirm: () => void;
    isDeleting: boolean;
    trigger?: React.ReactNode;
}

export function DeleteConfirmModal({ onConfirm, isDeleting, trigger }: DeleteConfirmModalProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {trigger || <Button variant="destructive">Delete</Button>}
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                        This action cannot be undone. This will permanently delete this event
                        and remove the data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-zinc-800 text-white hover:bg-zinc-900 hover:text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
