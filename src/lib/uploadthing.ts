import * as React from "react";

type UploadButtonProps = {
	endpoint: string;
	onClientUploadComplete?: (res: unknown) => void;
	onUploadError?: (error: Error) => void;
};

// Temporary placeholder UploadButton until UploadThing routes are restored
export function UploadButton(_props: UploadButtonProps) {
	return React.createElement(
		"button",
		{
			disabled: true,
			title: "Upload temporarily disabled",
			className:
				"inline-flex h-10 items-center justify-center rounded-md border bg-muted px-4 text-sm text-muted-foreground",
		},
		"Upload disabled",
	);
}
