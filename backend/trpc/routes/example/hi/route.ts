import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .mutation(() => {
    return {
      hello: "world",
      date: new Date(),
    };
  });
