export interface TrackingPromise {
  promise: Promise<Response>;
  startTime: number;
}

export function createTrackingPromise(
  promise: Promise<Response>,
): TrackingPromise {
  return { promise, startTime: performance.now() };
}

export async function formatResponseBody(
  responseText: string,
): Promise<string> {
  try {
    const jsonData = JSON.parse(responseText);
    return JSON.stringify(jsonData, null, 2);
  } catch {
    return responseText;
  }
}

export interface TrackedResponse {
  res: Response;
  responseTime: number;
  responseBody: string;
}

export async function resolveTrackedResponse(
  tracking: TrackingPromise,
): Promise<TrackedResponse> {
  const res = await tracking.promise;
  const responseTime = Math.round(performance.now() - tracking.startTime);
  const clonedResponse = res.clone();
  const responseText = await clonedResponse.text();
  const responseBody = await formatResponseBody(responseText);
  return { res, responseTime, responseBody };
}
