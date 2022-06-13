import * as React from "react";
import * as PropTypes from "prop-types";
import styled from "styled-components";
import * as moment from "moment";

import IPFSIcon from "../ipfsicon";
import ImageOverlayComponent from "../overlay";
import ParseMarkdownText from "../parsetext";
import MediaHelper from "../../../utilities/mediaHelper";
import Loader from "../loader/loader";
import { extractTimeStamp } from "../../../utilities/index";
import chainDetails from "./chain";

import ActionButton from "./styled/ActionButton";
import { useDecrypt, DecryptButton } from "./decrypt";

// ================= Define types
type chainNameType = "ETH_TEST_KOVAN" | "POLYGON_TEST_MUMBAI" | "ETH_MAINNET" | "POLYGON_MAINNET" | "THE_GRAPH" | undefined;

export type NotificationItemProps = {
  notificationTitle: string | undefined;
  notificationBody: string | undefined;
  cta: string | undefined;
  app: string | undefined;
  icon: string | undefined;
  image: string | undefined;
  url: string | undefined;
  isSpam: boolean | undefined;
  subscribeFn: any;
  isSubscribedFn: any;
  theme: string | undefined;
  chainName: chainNameType;
  isSecret: boolean;
  decryptFn: () => Promise<{ title: string, body: string, cta: string, image: string }>
};

type ContainerDataType = {
  cta?: boolean;
  timestamp?: string;
};

type MetaDataType = {
  hidden?: Boolean;
};

type MetaInfoType = MetaDataType & {hasLeft: boolean}

// ================= Define base component
const ViewNotificationItem: React.FC<NotificationItemProps> = ({
  notificationTitle,
  notificationBody,
  cta,
  app,
  icon,
  image,
  url,
  isSpam, //for rendering the spam conterpart of the notification component
  isSubscribedFn, //A function for getting if a user is subscribed to the channel in question
  subscribeFn, //A function for subscribing to the spam channel
  theme, //for specifying light and dark theme
  chainName,
  isSecret,
  decryptFn,
}) => {
  let { notificationBody: parsedBody, timeStamp } = extractTimeStamp(
    notificationBody || ""
  );

  timeStamp = '1654947872711';

  const {
    notifTitle, notifBody, notifCta, notifImage,
    setDecryptedValues,
    isSecretRevealed,
  } = useDecrypt(isSecret, { notificationTitle, parsedBody, cta, image });

  // store the image to be displayed in this state variable
  const [imageOverlay, setImageOverlay] = React.useState("");
  const [subscribeLoading, setSubscribeLoading] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(true); //use this to confirm if this is s

  const showMetaInfo = isSecret || timeStamp;

  // console.log({
  //   chainName,
  //   rightIcon,
  //   ai: ChainImages['CHAIN_ICONS']
  // })

  const gotToCTA = (e: any) => {
    e.stopPropagation();
    if (!MediaHelper.validURL(notifCta)) return;
    window.open(notifCta, "_blank");
  };

  const goToURL = (e: any) => {
    e.stopPropagation();
    if (!MediaHelper.validURL(url)) return;
    window.open(url, "_blank");
  };

  /**
   * A function which wraps around the function to subscribe a user to a channel
   * @returns
   */
  const onSubscribe = async (clickEvent: React.SyntheticEvent<HTMLElement>) => {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();

    if (!subscribeFn) return;
    try {
      setSubscribeLoading(true);
      await subscribeFn();
      setIsSubscribed(true);
    } finally {
      setSubscribeLoading(false);
    }
  };

  const onDecrypt = async () => {
    try {
      const decryptedPayload = await decryptFn();
      // to check if always both title, body are present
      if (decryptedPayload) {
        setDecryptedValues(decryptedPayload);
      }
    } catch (e) {
    } finally {
    }
  };

  React.useEffect(() => {
    if (!isSpam || !isSubscribedFn) return;
    isSubscribedFn().then((res: any) => {
      setIsSubscribed(Boolean(res));
    });
  }, [isSubscribedFn, isSpam]);

  if (isSubscribed && isSpam) return <></>;

  // render
  return (
    <Container
      timestamp={timeStamp}
      cta={MediaHelper.validURL(notifCta)}
      onClick={gotToCTA}
      theme={theme}
    >
      {/* header that only pops up on small devices */}
      <MobileHeader onClick={goToURL} theme={theme}>
        <HeaderButton>
          <ImageContainer theme={theme}>
            <IPFSIcon icon={icon} />
          </ImageContainer>
          {app}
        </HeaderButton>
        {chainName && chainDetails[chainName] ? (
          <BlockchainContainer>
            <NetworkDetails>
              <DelieveredViaText>DELIVERED VIA</DelieveredViaText>
              <NetworkName>{chainDetails[chainName].label}</NetworkName>
            </NetworkDetails>
            <ChainIconSVG>{chainDetails[chainName].icon}</ChainIconSVG>
          </BlockchainContainer>
        ) : null}
        {/* {
         isPoly?
       
        :
        <ChainIconSVG src="https://backend-kovan.epns.io/assets/ethereum.org.ico" alt=""/>
       } */}
      </MobileHeader>
      {/* header that only pops up on small devices */}

      {/* content of the component */}
      <ContentSection>
        {/* section for media content */}
        {notifImage &&
          // if its an image then render this
          (!MediaHelper.isMediaSupportedVideo(notifImage) ? (
            <MobileImage
              style={{ cursor: "pointer" }}
              onClick={() => setImageOverlay(notifImage || "")}
            >
              <img src={notifImage} alt="" />
            </MobileImage>
          ) : // if its a youtube url, RENDER THIS
          MediaHelper.isMediaYoutube(notifImage) ? (
            <MobileImage>
              <iframe
                id="ytplayer"
                width="640"
                allow="fullscreen;"
                height="360"
                src={MediaHelper.isMediaExternalEmbed(notifImage)}
              ></iframe>
            </MobileImage>
          ) : (
            // if its aN MP4 url, RENDER THIS
            <MobileImage>
              <video width="360" height="100%" controls>
                <source src={notifImage} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </MobileImage>
          ))}
        {/* section for media content */}

        {/* section for text content */}
        <ChannelDetailsWrapper>
          <ChannelTitle>
            <ChannelTitleLink theme={theme}>{notifTitle}</ChannelTitleLink>
          </ChannelTitle>
          <ChannelDesc>
            <ChannelDescLabel theme={theme}>
              <ParseMarkdownText text={notifBody} />
            </ChannelDescLabel>
          </ChannelDesc>
        </ChannelDetailsWrapper>
        {/* section for text content */}

        <ButtonGroup>
          {/* include a channel opt into */}
          {isSpam && (
            <ActionButton onClick={onSubscribe}>
              {subscribeLoading ? <Loader /> : "opt-in"}
            </ActionButton>
          )}
          {/* include a channel opt into */}

          {isSecret ? (
            <DecryptButton decryptFn={onDecrypt} isSecretRevealed={isSecretRevealed} />
            ): null}
        </ButtonGroup>
      </ContentSection>
      {/* content of the component */}

      {/* Meta Data section */}
      <ChannelMetaInfo hidden={!showMetaInfo} hasLeft={false}>
        {/* For left aligned items use ChannelMetaInfoLeft as parent */}
        <ChannelMetaInfoLeft hidden></ChannelMetaInfoLeft>

        {/* For right aligned items use ChannelMetaInfoRight */}
        <ChannelMetaInfoRight hidden={!showMetaInfo}>
          {isSecret ? (
            <SecretIconContainer>
              <SecretIcon></SecretIcon>
            </SecretIconContainer>
          ): null}
          
          {timeStamp ? (
            <TimestampLabel theme={theme}>
              {moment.utc(parseInt(timeStamp) * 1000).local().format("DD MMM YYYY | hh:mm A")}
            </TimestampLabel>
          ) : null}
        </ChannelMetaInfoRight>
      </ChannelMetaInfo>




      {/* add image overlay for full screen images */}
      <ImageOverlayComponent
        imageOverlay={imageOverlay}
        setImageOverlay={setImageOverlay}
      />
      {/* add image overlay for full screen images */}
    </Container>
  );
};

// ================= Define default props
ViewNotificationItem.propTypes = {
  notificationBody: PropTypes.string,
  notificationTitle: PropTypes.string,
  cta: PropTypes.string,
  image: PropTypes.string,
  app: PropTypes.string,
  url: PropTypes.string,
  isSpam: PropTypes.bool,
  subscribeFn: PropTypes.func,
  isSubscribedFn: PropTypes.func,
  theme: PropTypes.string,
};

ViewNotificationItem.defaultProps = {
  notificationTitle: "",
  notificationBody: "",
  cta: "",
  app: "",
  image: "",
  url: "",
  isSpam: false,
  subscribeFn: null,
  isSubscribedFn: null,
  theme: "light",
};

// ================= Define styled components
const MD_BREAKPOINT = "50050px"; //set an arbitrarily large number because we no longer use this breakpoint
const SM_BREAKPOINT = "900px";

const GUTTER_SPACE = {
  LARGE: '8px',
  SMALL: '6px'
};

const ContentSection = styled.div`
  display: block;
  padding: 12px;
  
  @media (min-width: ${SM_BREAKPOINT}) {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 20px;
    justify-content: space-between;
  }
`;

const BlockchainContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${GUTTER_SPACE.LARGE};
`;
const NetworkDetails = styled.div`
  text-align: right;
`;
const DelieveredViaText = styled.div`
  font-size: 14px;
  line-height: 14px;
  opacity: 20%;

  @media (max-width: ${SM_BREAKPOINT}) {
    font-size: 10px;
    line-height: 10px;
  }
`;
const NetworkName = styled.div`
  font-size: 10px;
  line-height: 10px;
  opacity: 40%;

  @media (max-width: ${SM_BREAKPOINT}) {
    font-size: 8px;
    line-height: 8px;
  }
`;

const ChainIconSVG = styled.div`
  width: 24px;
  height: 24px;

  // border-left: 0.1px solid white;

  svg, svg image {
    width: 100%;
    height: 100%;
  }

  @media (max-width: ${SM_BREAKPOINT}) {
    width: 18px;
    height: 18px;
  }
`;

const MobileImage = styled.div`
  @media (min-width: ${SM_BREAKPOINT}) {
    width: 220px;
    height: 200px;
    img,
    iframe,
    video {
      width: 100% !important;
      height: 100% !important;
      width: 100%;
      object-fit: cover;
      border-radius: 10px;
      border: 0;
    }
  }
  @media (max-width: ${SM_BREAKPOINT}) {
    display: block;
    img,
    iframe,
    video {
      border: 0;
      max-width: calc(100% + 24px);
      margin-left: -24px;
      margin-right: -24px;
      margin-top: -12px;
      margin-bottom: 12px;
    }
  }
`;
const ImageContainer = styled.span`
  background: ${(props) => (props.theme === "light" ? "#ededed" : "#444")};
  display: inline-block;
  margin-right: 10px;
  border-radius: 5px;
  
  width: 24px;
  height: 24px;

  @media (max-width: ${SM_BREAKPOINT}) {
    width: 18px;
    height: 18px;
  }
`;

const ChannelDetailsWrapper = styled.div`
  //   align-self: center;
`;

const Container = styled.div<ContainerDataType>`
  position: relative;
  overflow: hidden;
  font-family: "Source Sans Pro", Arial, sans-serif;
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  border: ${(props) =>
    props.cta
      ? "0.7px solid #35C5F3"
      : props.theme === "light"
      ? "1px solid rgba(231.0, 231.0, 231.0, 1);"
      : "1px solid #444"};
  cursor: ${(props) => (props.cta ? "pointer" : "")};

  background: ${(props) => (props.theme === "light" ? "#fff" : "#000")};
  border-radius: 10px;

  margin: 15px 0px;
  justify-content: center;

  justify-content: space-between;

  @media (max-width: ${MD_BREAKPOINT}) {
    flex-direction: column;
  }
`;

const MobileHeader = styled.div`
  display: none;

  @media (max-width: ${MD_BREAKPOINT}) {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${GUTTER_SPACE.LARGE};
    font-size: 14px;
    font-weight: 700;
    border-bottom: ${(props) =>
      props.theme === "light" ? "1px solid #ededed" : "1px solid #444"};
    color: #808080;
    background: ${(props) => (props.theme === "light" ? "#fafafa" : "#222")};
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    text-align: left;
  }
  @media (max-width: ${SM_BREAKPOINT}) {
    padding: ${GUTTER_SPACE.SMALL};
    font-size: 14px;
  }
`;

const HeaderButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;

  @media (max-width: ${SM_BREAKPOINT}) {
    font-size: 14px;
  }
`;

const ChannelTitle = styled.div`
  text-align: left;
  margin-bottom: 8px;

  @media (max-width: ${SM_BREAKPOINT}) {
    margin-bottom: 6px;
  }
`;

const ChannelTitleLink = styled.a`
  text-decoration: none;
  color: #e20880;
  font-size: 18px;
  font-weight: 600;

  @media (max-width: ${MD_BREAKPOINT}) {
    font-weight: 300;
    color: ${(props) =>
      props.theme === "light" ? "rgba(0, 0, 0, 0.5)" : "#808080"};
  }

  @media (max-width: ${SM_BREAKPOINT}) {
    font-size: 16px;
  }
`;

const ChannelDesc = styled.div`
  line-height: 20px;
  flex: 1;
  display: flex;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
  font-weight: 400;
  flex-direction: column;

  @media (max-width: ${SM_BREAKPOINT}) {
    font-size: 12px;
  }
`;

const ChannelDescLabel = styled.label`
  color: ${(props) => (props.theme === "light" ? "#000" : "#fff")};
  flex: 1;
  margin: 0px;
  text-align: left;
`;


const ChannelMetaInfo = styled.div<MetaInfoType>`
  display: ${(props) => (props.hidden ? "none" : "flex")};
  flex-direction: row;
  justify-content: ${(props) => (props.hasLeft ? "space-between" : "end")};
`;

const ChannelMetaSection = styled.div<MetaDataType>`
  display: ${(props) => (props.hidden ? "none" : "flex")};
  align-items: center;
`;

const ChannelMetaInfoLeft = styled(ChannelMetaSection)`
  justify-content: start;
`;

const ChannelMetaInfoRight = styled(ChannelMetaSection)`
  justify-content: end;
`;

const TimestampLabel = styled.label`
  color: #808080;

  background: ${(props) =>
    props.theme === "light" ? "rgba(250, 250, 250, 1)" : "#222"};

  border-radius: 0;
  border-top-left-radius: 6px;
  border-bottom-right-radius: 10px;

  border: ${(props) =>
    props.theme === "light" ? "1px solid #ededed" : "1px solid #444"};

  border-right: 0;
  border-bottom: 0;

  margin-bottom: -1px;
  margin-right: -1px;

  font-weight: 700;
  font-size: 10px;

  padding: 6px;
`;

const SecretIconContainer = styled.div`
  margin: 6px;
`;

const SecretIcon = styled.div`  
  width: 12px;
  height: 12px;
  
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    #e20880 12.5%,
    #674c9f 49.89%,
    #35c5f3 87.5%
  );
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
`;

// Export Default
export default ViewNotificationItem;
