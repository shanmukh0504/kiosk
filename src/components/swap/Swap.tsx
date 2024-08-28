import { useConnect } from "wagmi";

export const Swap = () => {
  const { connectors, connect } = useConnect();

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
