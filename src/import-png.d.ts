// Must declare module to be able to serve static images
declare module "*.png" {
  const value: any;
  export default value;
}
