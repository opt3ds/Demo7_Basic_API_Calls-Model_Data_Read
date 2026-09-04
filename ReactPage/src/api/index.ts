/**
 * Backend API wrapper
 * Endpoints shared by all panels are exported here uniformly
 */
import request from "../utils/request";

/**
 * Get property data by the feature external ID
 * @param params.lightweightName the lightweight model name
 * @param params.externalId the feature external ID (returned by the OptRapid3dLoader pick API)
 */
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
