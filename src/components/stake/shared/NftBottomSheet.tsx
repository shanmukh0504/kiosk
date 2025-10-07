import { ArrowNorthEastIcon, Button, Typography } from "@gardenfi/garden-book";

export const NftBottomSheet = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-8 rounded-2xl p-6">
      <Typography size="h4" weight="medium" className="w-full">
        View Gardener Pass
      </Typography>
      <div className="flex max-w-[296px] flex-col gap-8">
        <img
          src="https://garden-finance.imgix.net/garden_pass.png"
          alt="Garden Pass"
          className="w-full rounded-xl object-cover transition-all duration-300 ease-in-out"
        />
        <Button className="!font-regular w-full" size="lg" variant="secondary">
          <span>View at OpenSea</span>
          <ArrowNorthEastIcon className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
