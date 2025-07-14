import React from "react";
import Icon from "@/components/Icons/Icon";
import { faHotel } from "@fortawesome/free-solid-svg-icons";

interface Props {
  color?: string;
}

const HotelIcon: React.FC<Props> = (props) => {
  return <Icon icon={faHotel} onHoverText="Deliver to hotel" color={props.color} />;
};

export default HotelIcon;