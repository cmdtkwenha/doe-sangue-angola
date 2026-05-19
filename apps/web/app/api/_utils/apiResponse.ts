import { reportError, trackApiRequest } from "@doe-sangue-angola/shared-services";

type Handler<T> = () => Promise<T> | T;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiResponse<T>(handler: Handler<T>) {
  const started = Date.now();
  try {
    const data = await handler();
    trackApiRequest("api.route", 200, Date.now() - started);
    return Response.json({ ok: true, data });
  } catch (error) {
    if (error instanceof ApiError) {
      trackApiRequest("api.route", error.status, Date.now() - started);
      return Response.json({ ok: false, message: error.message }, { status: error.status });
    }
    reportError(error, { feature: "api.route" });
    trackApiRequest("api.route", 500, Date.now() - started);
    return Response.json(
      {
        ok: false,
        message: "Supabase indisponível. Tente novamente ou use modo mock."
      },
      { status: 500 }
    );
  }
}

export async function readJson<T extends object>(request: Request) {
  try {
    return (await request.json()) as Partial<T>;
  } catch {
    return {} as Partial<T>;
  }
}
