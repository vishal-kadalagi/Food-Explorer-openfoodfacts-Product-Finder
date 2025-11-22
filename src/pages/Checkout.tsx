import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Mail, Calendar, Clock } from "lucide-react";

const Checkout: React.FC = () => {
  const { items, totalItems, clear, addOrder } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<'review' | 'email' | 'confirmation'>('review');
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderTime, setOrderTime] = useState('');

  // Debug: Log items to console
  useEffect(() => {
    console.log("Checkout items:", items);
  }, [items]);

  // Calculate mocked totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * 240), 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 2000 ? 0 : 300;
  const total = subtotal + tax + shipping;

  const handlePlaceOrder = () => {
    // Validate email if on email step
    if (step === 'email') {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    // Generate a fake order ID and timestamp
    const newOrderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    setOrderId(newOrderId);
    
    // Get current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    setOrderDate(dateStr);
    setOrderTime(timeStr);

    // Move to next step or complete order
    if (step === 'review') {
      setStep('email');
    } else if (step === 'email') {
      // Place order - save to history, clear cart and show confirmation
      const order = {
        id: newOrderId,
        date: dateStr,
        time: timeStr,
        items: [...items],
        total: total,
        email: email
      };
      
      console.log("Placing order:", order);
      addOrder(order);
      clear();
      setStep('confirmation');
      toast.success("Order placed successfully!");
    }
  };

  const handleBack = () => {
    if (step === 'email') {
      setStep('review');
    } else if (step === 'confirmation') {
      navigate("/");
    } else {
      navigate(-1);
    }
  };

  // Render review order step
  const renderReviewOrder = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Review Your Order</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.code} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/5 transition-colors">
              {item.image ? (
                <img src={item.image} className="w-16 h-16 object-cover rounded" alt={item.name} />
              ) : (
                <div className="w-16 h-16 bg-muted/20 rounded flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No image</span>
                </div>
              )}
              <div className="flex-1">
                <div className="font-bold">{item.name}</div>
                {item.brand && <div className="text-sm text-muted-foreground">{item.brand}</div>}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm">
                    Qty: <Badge variant="secondary">{item.quantity}</Badge>
                  </div>
                  <div className="font-bold">₹{(item.quantity * 240).toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal ({totalItems} items)</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render email form step
  const renderEmailForm = () => (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <span>Email Confirmation</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Enter your email address to receive order confirmation and updates.
        </p>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-5"
          />
        </div>
      </CardContent>
    </Card>
  );

  // Render confirmation step with separate interface for ordered products
  const renderConfirmation = () => (
    <div className="space-y-6">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="mt-4">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Thank you for your order. A confirmation has been sent to <strong>{email}</strong>.
          </p>
          
          <div className="bg-muted/10 p-4 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{orderDate}</span>
              <Clock className="h-4 w-4 text-muted-foreground ml-4" />
              <span className="font-medium">{orderTime}</span>
            </div>
            <p className="font-mono text-sm">Order ID: {orderId}</p>
            <p className="text-sm mt-2">Estimated delivery: 3-5 business days</p>
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground">
            You'll receive updates about your order status via email.
          </p>
        </CardContent>
      </Card>

      {/* Separate interface for ordered products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Ordered Items</span>
            <Badge variant="secondary">{items.length} products</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.code} className="flex items-center gap-4 p-3 border rounded-lg bg-muted/5">
              {item.image ? (
                <img src={item.image} className="w-16 h-16 object-cover rounded" alt={item.name} />
              ) : (
                <div className="w-16 h-16 bg-muted/20 rounded flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No image</span>
                </div>
              )}
              <div className="flex-1">
                <div className="font-bold">{item.name}</div>
                {item.brand && <div className="text-sm text-muted-foreground">{item.brand}</div>}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm">
                    Quantity: <Badge variant="outline">{item.quantity}</Badge>
                  </div>
                  <div className="font-bold text-primary">₹{(item.quantity * 240).toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
        
        <div className="border-t p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total Paid</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

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
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {step === 'confirmation' ? 'Back to Home' : 'Back'}
            </Button>
          </div>

          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          
          {items.length === 0 && step !== 'confirmation' ? (
            <Card className="p-8 text-center">
              <p className="text-lg">Your cart is empty</p>
              <Button onClick={() => navigate("/")} className="mt-4">Continue Shopping</Button>
            </Card>
          ) : (
            <>
              {/* Progress indicator */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                  <div className={`flex flex-col items-center ${step === 'review' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      1
                    </div>
                    <span className="text-xs mt-1">Review</span>
                  </div>
                  <div className={`w-16 h-0.5 mx-2 ${step !== 'review' ? 'bg-primary' : 'bg-muted'}`}></div>
                  <div className={`flex flex-col items-center ${step === 'email' ? 'text-primary' : step === 'confirmation' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'email' ? 'bg-primary text-primary-foreground' : step === 'confirmation' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      2
                    </div>
                    <span className="text-xs mt-1">Email</span>
                  </div>
                  <div className={`w-16 h-0.5 mx-2 ${step === 'confirmation' ? 'bg-primary' : 'bg-muted'}`}></div>
                  <div className={`flex flex-col items-center ${step === 'confirmation' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'confirmation' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      3
                    </div>
                    <span className="text-xs mt-1">Confirm</span>
                  </div>
                </div>
              </div>

              {/* Content based on step */}
              {step === 'review' && renderReviewOrder()}
              {step === 'email' && renderEmailForm()}
              {step === 'confirmation' && renderConfirmation()}

              {/* Navigation buttons */}
              {step !== 'confirmation' && (
                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={handleBack}>
                    {step === 'review' ? 'Back to Cart' : 'Back'}
                  </Button>
                  <Button onClick={handlePlaceOrder} className="px-6">
                    {step === 'review' ? 'Continue to Email' : 'Place Order'}
                  </Button>
                </div>
              )}

              {step === 'confirmation' && (
                <div className="flex justify-center mt-6">
                  <Button onClick={() => navigate("/")} className="px-8">
                    Continue Shopping
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;