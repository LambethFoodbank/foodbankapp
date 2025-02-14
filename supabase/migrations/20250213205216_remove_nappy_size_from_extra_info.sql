
-- Current test data doesn't have nappy size info worth retaining, so just trim
UPDATE clients
  SET extra_information = regexp_replace(extra_information, '^Nappy([^E])+ Extra Information: ', '')
  WHERE extra_information LIKE 'Nappy%';
