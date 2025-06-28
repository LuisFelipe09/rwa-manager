// src/components/cross-chain/StepIndicator.tsx

interface StepIndicatorProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  tokenAddresses: { fuji: string; arbitrum: string };
  poolAddresses: { fuji: string; arbitrum: string };
}

export default function StepIndicator({
  activeStep,
  setActiveStep,
  tokenAddresses,
  poolAddresses,
}: StepIndicatorProps) {
  const steps = [
    { id: 1, title: "Deploy Tokens" },
    { id: 2, title: "Deploy Pools" },
    { id: 3, title: "Claim Roles" },
    { id: 4, title: "Admin Role" },
    { id: 5, title: "Link Tokens" },
    { id: 6, title: "Configure Pools" },
    { id: 7, title: "Mint Tokens" },
  ];

  const isStepComplete = (step: number) => {
    if (step === 1) return tokenAddresses.fuji && tokenAddresses.arbitrum;
    if (step === 2) return poolAddresses.fuji && poolAddresses.arbitrum;
    if (step === 3)
      return tokenAddresses.fuji && tokenAddresses.arbitrum && poolAddresses.fuji && poolAddresses.arbitrum;
    if (step === 4) return tokenAddresses.fuji && tokenAddresses.arbitrum;
    if (step === 5)
      return tokenAddresses.fuji && tokenAddresses.arbitrum && poolAddresses.fuji && poolAddresses.arbitrum;
    if (step === 6)
      return tokenAddresses.fuji && tokenAddresses.arbitrum && poolAddresses.fuji && poolAddresses.arbitrum;
    return activeStep > step;
  };

  return (
    <div className="overflow-x-auto">
      <ul className="steps steps-horizontal">
        {steps.map(step => (
          <li
            key={step.id}
            className={`step ${isStepComplete(step.id) ? "step-primary" : ""} ${activeStep === step.id ? "font-bold" : ""}`}
            onClick={() => isStepComplete(step.id) && setActiveStep(step.id)}
          >
            <div className="text-left">
              <span className="block">Paso {step.id}</span>
              <span className="block text-xs">{step.title}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
