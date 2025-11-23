"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export default function GlobalProgressBar() {
    return (
        <ProgressBar
            height="4px"
            color="#000000"
            options={{ showSpinner: false }}
            shallowRouting
        />
    );
}
