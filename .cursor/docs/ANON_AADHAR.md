Directory Structure:

└── quick-setup-main
├── src
│ ├── pages
│ │ ├── \_app.tsx
│ │ ├── \_document.tsx
│ │ └── index.tsx
│ └── styles
│ └── globals.css
├── next.config.js
├── postcss.config.js
└── tailwind.config.ts

---

## File: quick-setup-main/src/pages/\_app.tsx

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import React, { useEffect, useState } from "react";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";

export default function App({ Component, pageProps }: AppProps) {
const [ready, setReady] = useState<boolean>(false);
const [useTestAadhaar, setUseTestAadhaar] = useState<boolean>(false);

useEffect(() => {
setReady(true);
}, []);

return (
<>
{ready ? (
<AnonAadhaarProvider
          _useTestAadhaar={useTestAadhaar}
          _appName="Anon Aadhaar"
        >
<Component
{...pageProps}
setUseTestAadhaar={setUseTestAadhaar}
useTestAadhaar={useTestAadhaar}
/>
</AnonAadhaarProvider>
) : null}
</>
);
}

---

## File: quick-setup-main/src/pages/\_document.tsx

import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
return (

<Html lang="en">
<Head />
<body>
<Main />
<NextScript />
</body>
</Html>
)
}

---

## File: quick-setup-main/src/pages/index.tsx

import {
AnonAadhaarProof,
LogInWithAnonAadhaar,
useAnonAadhaar,
useProver,
} from "@anon-aadhaar/react";
import { useEffect } from "react";

type HomeProps = {
setUseTestAadhaar: (state: boolean) => void;
useTestAadhaar: boolean;
};

export default function Home({ setUseTestAadhaar, useTestAadhaar }: HomeProps) {
// Use the Country Identity hook to get the status of the user.
const [anonAadhaar] = useAnonAadhaar();
const [, latestProof] = useProver();

useEffect(() => {
if (anonAadhaar.status === "logged-in") {
console.log(anonAadhaar.status);
}
}, [anonAadhaar]);

const switchAadhaar = () => {
setUseTestAadhaar(!useTestAadhaar);
};

return (

<div className="min-h-screen bg-gray-100 px-4 py-8">
<main className="flex flex-col items-center gap-8 bg-white rounded-2xl max-w-screen-sm mx-auto h-[24rem] md:h-[20rem] p-8">
<h1 className="font-bold text-2xl">Welcome to Anon Aadhaar Example</h1>
<p>Prove your Identity anonymously using your Aadhaar card.</p>

        {/* Import the Connect Button component */}
        <LogInWithAnonAadhaar nullifierSeed={1234} />

        {useTestAadhaar ? (
          <p>
            You&apos;re using the <strong> test </strong> Aadhaar mode
          </p>
        ) : (
          <p>
            You&apos;re using the <strong> real </strong> Aadhaar mode
          </p>
        )}
        <button
          onClick={switchAadhaar}
          type="button"
          className="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Switch for {useTestAadhaar ? "real" : "test"}
        </button>
      </main>
      <div className="flex flex-col items-center gap-4 rounded-2xl max-w-screen-sm mx-auto p-8">
        {/* Render the proof if generated and valid */}
        {anonAadhaar.status === "logged-in" && (
          <>
            <p>✅ Proof is valid</p>
            <p>Got your Aadhaar Identity Proof</p>
            <>Welcome anon!</>
            {latestProof && (
              <AnonAadhaarProof code={JSON.stringify(latestProof, null, 2)} />
            )}
          </>
        )}
      </div>
    </div>

);
}

---

## File: quick-setup-main/src/styles/globals.css

@tailwind base;
@tailwind components;
@tailwind utilities;

---

## File: quick-setup-main/next.config.js

/\*_ @type {import('next').NextConfig} _/
const nextConfig = {
reactStrictMode: false,
webpack: (config) => {
config.resolve.fallback = {
fs: false,
readline: false,
};
return config;
},
};

module.exports = nextConfig;

---

## File: quick-setup-main/postcss.config.js

module.exports = {
plugins: {
tailwindcss: {},
autoprefixer: {},
},
}

---

## File: quick-setup-main/tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
content: [
'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
],
theme: {
extend: {
backgroundImage: {
'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
'gradient-conic':
'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
},
},
},
plugins: [],
}
export default config
