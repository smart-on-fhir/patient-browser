#!/bin/sh

# rm -rf ./some_tmp_dir
# mkdir ./some_tmp_dir
# cd ./some_tmp_dir
# curl -LsS https://github.com/smart-on-fhir/generated-sample-data/archive/master.zip > file.zip
# unzip file.zip "generated-sample-data-master/R4/SYNTHEA/*" -d .
# rm file.zip


files=(\
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/hospitalInformation1625487628939.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/practitionerInformation1625487628939.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/Amal279_Bayer639_5e15e9de-be53-db7c-ca98-5c76734c4a27.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/Andreas188_Rosenbaum794_3d3a9956-55ab-4905-1f1c-69872391aa50.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/Angel97_Collier206_f7885186-72df-a86d-4a72-4588b61dd0b4.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/Denisse335_Crooks415_831a0351-1b17-29cd-7942-b088eb527057.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/Diedra595_Bogisich202_2a1f8c43-6137-d98d-c882-198a4b46e0bd.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/January966_Doyle959_adac254e-0db6-57a5-e93c-3af2cb160dfe.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/Josefina523_Conroy74_c69b1f72-f67d-19b1-cf3f-977e22aa49e9.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/Ken316_Hauck852_30698f23-2ad6-bac0-45c4-0d5982c27af2.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/Lester513_Douglas31_285d4b42-05f9-976b-306a-0037512f465a.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/Michaele314_Pfannerstill264_1fc6ae6e-2fe5-b130-136c-e26c574f9fc1.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/Palmer257_Price929_579907fd-d355-2199-e83d-d9df07ebaa7a.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/Philip822_Littel644_56e0e976-d7cb-d008-bb60-ca17b19cae7f.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/Stuart913_Schaden604_8c9a714c-b4c8-9b3d-8bd4-f1c8aaaf6bba.json
https://raw.githubusercontent.com/joundso/fhir-demo-data/master/fhir/Wilfredo622_Schmeler639_0952ff39-a692-ac8a-8f0a-ea9ef9424207.json
)

for item in ${files[*]}
do
    echo "Item $item:"
   curl -LsS $item | curl \
    -sS \
    -X POST \
    -H 'Content-Type:application/fhir+json' \
    --retry-connrefuse \
    --connect-timeout 30 \
    --max-time 600 \
    --retry 5 \
    --retry-delay 15 \
    --data-binary @- \
    http://fhir:8080/fhir
done
