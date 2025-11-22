import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, Package, Calendar, Clock } from "lucide-react";

const Orders: React.FC = () => {
  const { orders } = useCart();
  const navigate = useNavigate();

  // Debug: Log orders to console
  useEffect(() => {
    console.log("Orders:", orders);
  }, [orders]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* New dynamic food-themed background */}
      <div className="fixed inset-0 z-0">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-orange-50 to-red-50"></div>
        
        {/* Food pattern background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255, 165, 0, 0.2) 0%, transparent 20%),
                              radial-gradient(circle at 80% 30%, rgba(76, 175, 80, 0.2) 0%, transparent 20%),
                              radial-gradient(circle at 40% 70%, rgba(244, 67, 54, 0.2) 0%, transparent 20%),
                              radial-gradient(circle at 70% 80%, rgba(255, 193, 7, 0.2) 0%, transparent 20%)`,
            backgroundSize: '600px 600px'
          }}></div>
        </div>
        
        {/* Floating food emojis */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={`emoji-${i}`}
              className="absolute animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 20 + 15}px`,
                animationDuration: `${Math.random() * 20 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.3,
                transform: `rotate(${Math.random() * 360}deg)`,
                filter: 'blur(0.5px)'
              }}
            >
              {['🍎', '🍕', '🥕', '🍇', '🍌', '🍔', '🍓', '🥝', '🍑', '🍒', '🥥', '🥦', '🥨', '🥞', '🍩'][Math.floor(Math.random() * 15)]
              }
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative z-10 min-h-screen bg-background/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <h1 className="text-3xl font-bold mb-6">Order History</h1>

          {orders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-lg text-muted-foreground">You haven't placed any orders yet</p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Start Shopping
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <CardTitle className="text-lg">Order {order.id}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{order.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{order.time}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-4 p-4">
                      {order.items.map((item) => (
                        <div key={item.code} className="flex items-center gap-4 p-3 border rounded-lg">
                          {item.image ? (
                            <img src={item.image} className="w-12 h-12 object-cover rounded" alt={item.name} />
                          ) : (
                            <div className="w-12 h-12 bg-muted/20 rounded flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            {item.brand && <div className="text-sm text-muted-foreground">{item.brand}</div>}
                          </div>
                          <div className="text-right">
                            <div className="text-sm">Qty: {item.quantity}</div>
                            <div className="font-bold">₹{(item.quantity * 240).toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t p-4 bg-muted/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-muted-foreground">Sent to: </span>
                          <span className="font-medium">{order.email}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total</div>
                          <div className="text-xl font-bold">₹{order.items.reduce((sum, item) => sum + (item.quantity * 240), 0).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;