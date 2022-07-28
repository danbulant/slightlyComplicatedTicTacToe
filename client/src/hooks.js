// @ts-ignore
export async function handle({ event, resolve }) {
    return resolve(event, { ssr: false });
}