import { reportError, trackApiRequest } from "@doe-sangue-angola/shared-services";

type Handler<T> = () => Promise<T> | T;

export async function apiResponse<T>(handler: Handler<T>) {
  const started = Date.now();
  try {
    const data = await handler();
    trackApiRequest("api.route", 200, Date.now() - started);
    return Response.json({ ok: true, data });
  } catch (error) {
    reportError(error, { feature: "api.route" });
    trackApiRequest("api.route", 500, Date.now() - started);
    return Response.json(
      {
        ok: false,
        message: "Não foi possível concluir o pedido. Tente novamente."
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
