"use client";
import { observer } from "mobx-react-lite";
import TiltedCard from "./tiled-card";
import { cardHeight, cardWidth } from "../utils/constants";

export const MyCard = observer(() => {
  return (
    <TiltedCard
      imageSrc="/kapi.jpeg"
      altText="Kapi"
      overlayContent={<p className="">Kapibara</p>}
      width={cardWidth}
      height={cardHeight}
      dead
    />
  );
});
