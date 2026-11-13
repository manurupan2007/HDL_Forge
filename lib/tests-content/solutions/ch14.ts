/** Reference top.sv solutions for chapter 14. Verify scripts only; never bundled. */
export const SOLUTIONS_CH14: Record<string, string> = {
  "interfaces:uart-tx": `module top (
  input  logic clk, rst,
  input  logic baud_en,
  input  logic tx_en,
  input  logic [7:0] d,
  output logic tx,
  output logic busy
);
  typedef enum logic [1:0] { IDLE, SEND } state_t;
  state_t st;
  logic [3:0] bitcnt;
  logic [7:0] shreg;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      st <= IDLE;
      tx <= 1'b1;
      busy <= 1'b0;
      bitcnt <= 4'd0;
      shreg <= 8'h00;
    end else begin
      case (st)
        IDLE: begin
          busy <= 1'b0;
          tx <= 1'b1;
          if (tx_en) begin
            st <= SEND;
            busy <= 1'b1;
            shreg <= d;
            bitcnt <= 4'd0;
            tx <= 1'b0;          // start bit
          end
        end
        SEND: if (baud_en) begin
          if (bitcnt == 4'd8) begin
            tx <= 1'b1;          // stop bit
            st <= IDLE;
          end else begin
            tx <= shreg[0];      // LSb first
            shreg <= shreg >> 1;
            bitcnt <= bitcnt + 4'd1;
          end
        end
        default: st <= IDLE;
      endcase
    end
  end
endmodule
`,
  "interfaces:uart-rx": `module top (
  input  logic clk, rst, baud_en, rx,
  output logic [7:0] dout,
  output logic ferr, rdy
);
  typedef enum logic [2:0] { IDLE, START, BITS, STOP } state_t;
  state_t st;
  logic [3:0] bitcnt;
  logic [7:0] shreg;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      st <= IDLE;
      rdy <= 1'b0;
      ferr <= 1'b0;
      bitcnt <= 4'd0;
      shreg <= 8'h00;
      dout <= 8'h00;
    end else begin
      rdy <= 1'b0;
      case (st)
        IDLE: begin
          ferr <= 1'b0;
          if (!rx) st <= START;      // falling edge of start
        end
        START: if (baud_en) begin
          st <= BITS;                // now centred in the start bit
          bitcnt <= 4'd0;
        end
        BITS: if (baud_en) begin
          shreg <= {rx, shreg[7:1]}; // MSb-first into a reversing shift
          bitcnt <= bitcnt + 4'd1;   // => LSb recovered last
          if (bitcnt == 4'd7) st <= STOP;
        end
        STOP: if (baud_en) begin
          ferr <= ~rx;               // stop bit must be high
          rdy  <= 1'b1;
          dout <= shreg;
          st   <= IDLE;
        end
        default: st <= IDLE;
      endcase
    end
  end
endmodule
`,
  "interfaces:uart-loopback": `module uart_tx (
  input  logic clk, rst,
  input  logic baud_en,
  input  logic tx_en,
  input  logic [7:0] d,
  output logic tx,
  output logic busy
);
  typedef enum logic [1:0] { IDLE, SEND } state_t;
  state_t st;
  logic [3:0] bitcnt;
  logic [7:0] shreg;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      st <= IDLE;
      tx <= 1'b1;
      busy <= 1'b0;
      bitcnt <= 4'd0;
      shreg <= 8'h00;
    end else begin
      case (st)
        IDLE: begin
          busy <= 1'b0;
          tx <= 1'b1;
          if (tx_en) begin
            st <= SEND;
            busy <= 1'b1;
            shreg <= d;
            bitcnt <= 4'd0;
            tx <= 1'b0;          // start bit
          end
        end
        SEND: if (baud_en) begin
          if (bitcnt == 4'd8) begin
            tx <= 1'b1;          // stop bit
            st <= IDLE;
          end else begin
            tx <= shreg[0];      // LSb first
            shreg <= shreg >> 1;
            bitcnt <= bitcnt + 4'd1;
          end
        end
        default: st <= IDLE;
      endcase
    end
  end
endmodule

module uart_rx (
  input  logic clk, rst, baud_en, rx,
  output logic [7:0] dout,
  output logic ferr, rdy
);
  typedef enum logic [2:0] { IDLE, START, BITS, STOP } state_t;
  state_t st;
  logic [3:0] bitcnt;
  logic [7:0] shreg;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      st <= IDLE;
      rdy <= 1'b0;
      ferr <= 1'b0;
      bitcnt <= 4'd0;
      shreg <= 8'h00;
      dout <= 8'h00;
    end else begin
      rdy <= 1'b0;
      case (st)
        IDLE: begin
          ferr <= 1'b0;
          if (!rx) st <= START;
        end
        START: if (baud_en) begin
          st <= BITS;
          bitcnt <= 4'd0;
        end
        BITS: if (baud_en) begin
          shreg <= {rx, shreg[7:1]};
          bitcnt <= bitcnt + 4'd1;
          if (bitcnt == 4'd7) st <= STOP;
        end
        STOP: if (baud_en) begin
          ferr <= ~rx;
          rdy  <= 1'b1;
          dout <= shreg;
          st   <= IDLE;
        end
        default: st <= IDLE;
      endcase
    end
  end
endmodule

module top (
  input  logic clk, rst,
  input  logic baud_en,
  input  logic tx_en,
  input  logic [7:0] d_in,
  output logic tx,
  output logic busy,
  output logic [7:0] d_out,
  output logic rdy,
  output logic ferr
);
  uart_tx tx_inst (clk, rst, baud_en, tx_en, d_in, tx, busy);
  uart_rx rx_inst (clk, rst, baud_en, tx, d_out, ferr, rdy);
endmodule
`,
};