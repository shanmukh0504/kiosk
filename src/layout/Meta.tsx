import { FC } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { AppConfig } from "./appConfig";
import metaImage from "/metadata.png";

export type IMetaProps = {
  title: string;
  description: string;
  canonical?: string;
};

export const Meta: FC<IMetaProps> = ({ title, description, canonical }) => {
  const router = useLocation();
  const basePath = router.pathname.split("/")[1];

  return (
    <Helmet>
      <meta charSet="UTF-8" key="charset" />
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1"
        key="viewport"
      />
      <link
        rel="apple-touch-icon"
        href={`${basePath}/apple-touch-icon.png`}
        key="apple"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={`${basePath}/favicon-32x32.png`}
        key="icon32"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`${basePath}/favicon-16x16.png`}
        key="icon16"
      />
      <link rel="icon" href={`${basePath}/favicon.ico`} key="favicon" />

      <title key="title">{title}</title>
      <meta name="description" content={description} />

      <meta property="og:type" content={"image/png"} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={AppConfig.locale} />
      <meta property="og:site_name" content={AppConfig.site_name}></meta>
      <link rel="canonical" href={AppConfig.canonical + canonical} />

      <meta name="keywords" content="Garden" />
      <meta name="keywords" content="Bitcoin exchange" />
      <meta name="keywords" content="Bitcoin bridge" />
      <meta name="keywords" content="fast BTC bridge" />
      <meta name="keywords" content="instant BTC bridge" />
      <meta name="keywords" content="decentralized BTC swap" />
      <meta name="keywords" content="atomic swap" />
      <meta name="keywords" content="cross-chain swap" />
      <meta name="keywords" content="Ethereum Bitcoin bridge" />
      <meta name="keywords" content="Arbitrum Bitcoin bridge" />
      <meta name="keywords" content="secure BTC transfer" />

      {/* Twitter tags */}
      <meta name="twitter:card" content={"summary_large_image"} />
      <meta name="twitter:site" content={"garden.finance"} />
      <meta name="twitter:creator" content={"@garden_finance"} />
      <meta name="twitter:description" content={description} />
      {/* End Twitter tags */}
    </Helmet>
  );
};
