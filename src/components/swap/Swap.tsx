import { useAccount, useConnect } from "wagmi";

export const Swap = () => {
  const { connectors, connect } = useConnect();
  const { address } = useAccount();
  console.log("account :", address);

  return (
    <div className="flex flex-col">
      {connectors.map((connector) => (
        <button key={connector.uid} onClick={() => connect({ connector })}>
          {connector.name}
        </button>
      ))}
    </div>
  );
};
