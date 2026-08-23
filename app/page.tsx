import { StoreProvider } from "@/lib/store";
import { ZenShell } from "@/components/zen-shell";

export default function Home() {
  return (
    <StoreProvider>
      <ZenShell />
    </StoreProvider>
  );
}
