import request from "../utils/request";

export function getPropertiesStation(params: {
  lightweightName: string;
  externalId: string;
}) {
  return request.request({
    url: `/api/app/model/GetPropertyDataByExternalId`,
    method: "get",
    params: params,
  });
}
