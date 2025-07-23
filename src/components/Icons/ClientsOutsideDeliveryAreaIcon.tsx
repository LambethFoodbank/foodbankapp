import React from "react";
import Icon from "@/components/Icons/Icon";
import { faWarning } from "@fortawesome/free-solid-svg-icons";

const ClientOutsideDeliveryAreaIcon: React.FC = () => {
    return <Icon icon={faWarning} onHoverText="Outside Delivery Area" color="#B8860B" />;
};

export default ClientOutsideDeliveryAreaIcon;
