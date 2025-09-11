create or replace view "public"."emergency_bags_plus" as select emergency_bags.id AS emergency_bag_id,
    emergency_bags.packing_date,
    emergency_bags.type,
    emergency_bags.amount,
    emergency_bags.created_at,
    collection_centres.name AS collection_centre_name,
    collection_centres.acronym AS collection_centre_acronym,
    collection_centres.is_delivery
from emergency_bags
     left join collection_centres on emergency_bags.collection_centre = collection_centres.primary_key;
