const API_URL = "https://qle1yy2ydc.execute-api.ap-southeast-1.amazonaws.com/V1/save_order";

const payload = {
  app_key: "cjx3hasvuzwe2n4prmg7y19ofkit8005",
  app_secret: "f3f03bb0535013caa22aa529488074bf5fd60de4",
  access_token: "b115795cb3bb425e9065dcda2fe3ff10cc91f2c6",
  orderinfo: {
    OrderInfo: {
      Restaurant: {
        details: {
          res_name: "The Biryani Canteen",
          address: "Sample Address",
          contact_information: "9876543210",
          restID: "sikue9cb"
        }
      },
      Customer: {
        details: {
          email: "test@example.com",
          name: "Test User",
          address: "123 Test Street",
          phone: "9876543210",
          latitude: "",
          longitude: ""
        }
      },
      Order: {
        details: {
          orderID: "test-" + Date.now(),
          preorder_date: "2026-04-17",
          preorder_time: "18:35:00",
          service_charge: "0",
          sc_tax_amount: "0",
          delivery_charges: "0",
          dc_tax_percentage: "0",
          dc_tax_amount: "0",
          packing_charges: "0",
          pc_tax_amount: "0",
          pc_tax_percentage: "0",
          order_type: "H",
          advanced_order: "N",
          urgent_order: false,
          urgent_time: 0,
          payment_type: "COD",
          table_no: "",
          no_of_persons: "0",
          discount_total: "0",
          tax_total: "0.50",
          discount_type: "F",
          total: "10.50",
          description: "",
          created_on: "2026-04-17 18:35:00",
          enable_delivery: 1,
          min_prep_time: 20,
          callback_url: "https://order.thebiryanicanteen.com/api/petpooja/callback"
        }
      },
      OrderItem: {
        details: [
          {
            id: "10468380",
            name: "Almonds",
            tax_inclusive: false,
            gst_liability: "restaurant",
            item_tax: [
              { id: "1999", name: "SGST", tax_percentage: "2.5", amount: "0.25" },
              { id: "2000", name: "CGST", tax_percentage: "2.5", amount: "0.25" }
            ],
            item_discount: "0",
            price: "10.00",
            final_price: "10.00",
            quantity: "1",
            description: "",
            variation_name: "",
            variation_id: "",
            AddonItem: {
              details: []
            }
          }
        ]
      },
      Tax: {
        details: [
          { id: "1999", title: "SGST", type: "P", price: "2.5", tax: "0.25", restaurant_liable_amt: "0.25" },
          { id: "2000", title: "CGST", type: "P", price: "2.5", tax: "0.25", restaurant_liable_amt: "0.25" }
        ]
      },
      Discount: {
        details: []
      }
    },
    udid: "",
    device_type: "Web"
  }
};

const res = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
console.log(`Status: ${res.status} | Response: ${await res.text()}`);
