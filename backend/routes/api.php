<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\UserPreferencesController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServiceQuoteController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ShippingAddressController;
use App\Http\Controllers\ShippingMethodController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ConsultingController;
use App\Http\Controllers\ConsultingReviewController;
use App\Http\Controllers\WorkstationController;
use App\Http\Controllers\ProfessionalController;
use App\Http\Controllers\ProfessionalCategoryController;
use App\Http\Controllers\HustleController;
use App\Http\Controllers\HustleApplicationController;
use App\Http\Controllers\HustleMessageController;
use App\Http\Controllers\BusinessProfileController;
use App\Http\Controllers\BusinessCustomerController;
use App\Http\Controllers\BusinessInvoiceController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::get('/transactions/filter', [TransactionController::class, 'filter']);
        Route::post('/transactions/export-statement', [TransactionController::class, 'exportStatement']);
        Route::get('/transactions/{transactionId}', [TransactionController::class, 'getTransactionDetails']);
        Route::get('/transactions/{transactionId}/receipt', [TransactionController::class, 'generateReceipt'])
            ->middleware('auth:sanctum');
        
        // Wallet Funding Routes
        Route::post('/wallet/bank-transfer', [WalletController::class, 'bankTransferPayment']);
        Route::post('/wallet/initiate-paystack-payment', [WalletController::class, 'initiatePaystackPayment']);
        Route::post('/wallet/verify-paystack-payment', [WalletController::class, 'verifyPaystackPayment']);
        
        // Quote Details and Messages
        Route::get('/quotes/{id}', [QuoteController::class, 'show']);
        Route::post('/quotes/{id}/messages', [QuoteController::class, 'sendMessage']);
        Route::post('/quotes/{id}/mark-messages-read', [QuoteController::class, 'markMessagesAsRead']);
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::get('/projects/{id}', [ProjectController::class, 'show']);
        Route::get('/invoices/{id}/download', [InvoiceController::class, 'downloadPDF']);
        Route::post('/invoices/{id}/process-payment', [InvoiceController::class, 'processPayment']);
        Route::get('/invoices/{id}/receipt', [InvoiceController::class, 'viewReceipt']);
        Route::get('/invoices/{id}/receipt/download', [InvoiceController::class, 'downloadReceipt']);
        
        // Cart Routes
        Route::prefix('cart')->group(function () {
            Route::get('/', [CartController::class, 'getCart']);
            Route::post('/add', [CartController::class, 'addToCart']);
            Route::put('/items/{itemId}', [CartController::class, 'updateQuantity']);
            Route::delete('/items/{itemId}', [CartController::class, 'removeItem']);
            Route::get('/count', [CartController::class, 'getCartCount']);
        });
        
        // Wishlist Routes
        Route::prefix('wishlist')->group(function () {
            Route::get('/', [WishlistController::class, 'getWishlist']);
            Route::get('/count', [WishlistController::class, 'getWishlistCount']);
            Route::post('/toggle/{productId}', [WishlistController::class, 'toggleWishlistItem']);
            Route::get('/check/{productId}', [WishlistController::class, 'checkWishlistStatus']);
        });
        
        // Orders
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::get('/orders/{id}/tracking', [OrderController::class, 'tracking']);
        Route::get('/orders/{id}/invoice', [OrderController::class, 'downloadInvoice']);
        
        // Workstation routes
        Route::prefix('workstation')->group(function () {
            Route::get('/plans', [WorkstationController::class, 'getPlans']);
            Route::post('/subscriptions', [WorkstationController::class, 'createSubscription']);
            Route::get('/subscription', [WorkstationController::class, 'getCurrentSubscription']);
            Route::get('/subscriptions/history', [WorkstationController::class, 'getSubscriptionHistory']);
            Route::post('/subscriptions/{subscription}/renew', [WorkstationController::class, 'renewSubscription']);
            Route::post('/subscriptions/{subscription}/cancel', [WorkstationController::class, 'cancelSubscription']);
            Route::get('/subscriptions/{subscription}/access-card', [WorkstationController::class, 'downloadAccessCard']);
        });
    });
});

// User Preferences Route
Route::middleware(['auth:sanctum'])->group(function () {
    Route::put('/user/preferences', [UserController::class, 'updatePreferences']);
    Route::put('/user/type', [UserController::class, 'updateUserType']);
});

// Enrollment Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('enrollments')->group(function () {
        Route::post('/enroll', [EnrollmentController::class, 'enroll']);
        Route::get('/', [EnrollmentController::class, 'getUserEnrollments']);
        Route::post('/full-payment', [EnrollmentController::class, 'processFullTuitionPayment']);
        Route::post('/full-tuition-payment', [EnrollmentController::class, 'processFullTuitionPayment']);
        Route::post('/full-payment', [EnrollmentController::class, 'processFullTuitionPayment']);
        Route::post('/installment-payment', [EnrollmentController::class, 'processInstallmentPayment']);
        Route::post('/specific-installment-payment', [EnrollmentController::class, 'processSpecificInstallmentPayment']);
        Route::post('/installment-plan', [EnrollmentController::class, 'processInstallmentPlan']);
        Route::post('/pay-installment', [EnrollmentController::class, 'payInstallment']);
        Route::get('/{enrollmentId}/course-details', [EnrollmentController::class, 'getCourseDetailsFromEnrollment']);
    });
});

// Course Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('courses')->group(function () {
        Route::get('/enrolled', [EnrollmentController::class, 'getUserEnrolledCourses']);
        Route::get('/{courseId}/details', [CourseController::class, 'getCourseDetails']);
        Route::get('/{courseId}/notices', [CourseController::class, 'getCourseNotices']);
        Route::delete('/notices/{courseNoticeId}', [CourseController::class, 'deleteUserCourseNotice']);
        Route::get('/{courseId}/exams', [CourseController::class, 'getCourseExams']);
        Route::post('/{courseId}/exams/{examId}/participate', 
            [CourseController::class, 'startExamParticipation']
        )->middleware(['auth:sanctum']);
        Route::get('/{courseId}/enrollment', [EnrollmentController::class, 'getUserCourseEnrollment']);        
        Route::get('/{courseId}/installments', [EnrollmentController::class, 'getCourseInstallments']);

    });
});

Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{courseId}', [CourseController::class, 'show']);
Route::get('/courses/{courseId}/features', [CourseController::class, 'getCourseFeatures']);
Route::get('/courses/{courseId}/features/{featureId}', [CourseController::class, 'getCourseFeature']);
Route::get('/courses/{courseId}/curriculum', [CourseController::class, 'getCurriculum']);

// Settings Routes
Route::prefix('settings')->group(function () {
    Route::get('/', [SettingsController::class, 'index']);
    Route::put('/', [SettingsController::class, 'update']);
    Route::get('/{key}', [SettingsController::class, 'getSetting']);
});

Route::get('/services/categories', [ServiceController::class, 'getCategoriesWithServices'])->middleware(['auth:sanctum']);
Route::get('/services/{serviceId}/quote-details', [ServiceQuoteController::class, 'getServiceDetails'])->middleware(['auth:sanctum']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/quotes', [QuoteController::class, 'store']);
    Route::get('/quotes', [QuoteController::class, 'index']);
});

Route::prefix('products')->group(function () {
    Route::get('/featured', [ProductController::class, 'getFeaturedProducts']);
    Route::get('/categories', [ProductController::class, 'getCategories']);
    Route::get('/', [ProductController::class, 'getProducts']);
    Route::get('/promotions', [ProductController::class, 'getPromotions']);
    Route::get('/brands', [ProductController::class, 'getBrands']);
    Route::get('/{id}', [ProductController::class, 'getProductDetails']);
});

// Shipping Address Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/shipping/states', [ShippingAddressController::class, 'getStates']);
    Route::get('/shipping/addresses', [ShippingAddressController::class, 'index']);
    Route::post('/shipping/addresses', [ShippingAddressController::class, 'store']);
    Route::put('/shipping/addresses/{address}', [ShippingAddressController::class, 'update']);
    Route::delete('/shipping/addresses/{address}', [ShippingAddressController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/shipping/methods', [ShippingMethodController::class, 'getMethodsForAddress']);
});

// Order routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
});

// Consulting Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('consulting')->group(function () {
        Route::get('slots', [ConsultingController::class, 'getAvailableSlots']);
        Route::post('bookings', [ConsultingController::class, 'createBooking']);
        Route::get('bookings', [ConsultingController::class, 'getUserBookings']);
        Route::post('bookings/{booking}/cancel', [ConsultingController::class, 'cancelBooking']);
        Route::post('bookings/{booking}/review', [ConsultingReviewController::class, 'store']);
        Route::get('bookings/{id}', [ConsultingController::class, 'getBookingDetails']);
        Route::get('bookings/{id}/review', [ConsultingController::class, 'getBookingReview']);
    });
});

Route::post('/workstation/subscriptions/reactivate', [WorkstationController::class, 'reactivateSubscription'])
    ->middleware('auth:sanctum');

// Professional Profile Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/professional/profile/check', [ProfessionalController::class, 'checkProfile']);
    Route::post('/professional/profile', [ProfessionalController::class, 'store']);
    Route::put('/professional/profile', [ProfessionalController::class, 'update']);
});

// Professional Category Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/professional/categories', [ProfessionalCategoryController::class, 'index']);
    Route::get('/professional/categories/{id}', [ProfessionalCategoryController::class, 'show']);
});

// Hustle Routes
Route::middleware('auth:sanctum')->group(function () {
    // Hustle listing and details
    Route::get('/hustles', [HustleController::class, 'index']);
    Route::get('/hustles/{id}', [HustleController::class, 'show']);

    // Hustle applications
    Route::get('/hustle-applications', [HustleApplicationController::class, 'index']);
    Route::post('/hustles/{hustleId}/apply', [HustleApplicationController::class, 'store']);
    Route::post('/hustle-applications/{id}/withdraw', [HustleApplicationController::class, 'withdraw']);
    Route::get('/my-hustles', [HustleApplicationController::class, 'getMyHustles']);

    // Hustle messages
    Route::get('/hustles/{hustleId}/messages', [HustleMessageController::class, 'getMessages']);
    Route::post('/hustles/{hustleId}/messages', [HustleMessageController::class, 'sendMessage']);
    Route::post('/hustles/{hustleId}/messages/mark-read', [HustleMessageController::class, 'markMessagesAsRead']);
});

// Business Routes
Route::middleware('auth:sanctum')->prefix('business')->group(function () {
    // Business Profile Routes
    Route::get('/profile/check', [BusinessProfileController::class, 'checkProfile']);
    Route::get('/profile', [BusinessProfileController::class, 'show']);
    Route::post('/profile', [BusinessProfileController::class, 'store']);
    Route::put('/profile', [BusinessProfileController::class, 'update']);

    // Customer Routes
    Route::get('/customers', [BusinessCustomerController::class, 'index']);
    Route::post('/customers', [BusinessCustomerController::class, 'store']);
    Route::get('/customers/{customer}', [BusinessCustomerController::class, 'show']);
    Route::put('/customers/{customer}', [BusinessCustomerController::class, 'update']);
    Route::delete('/customers/{customer}', [BusinessCustomerController::class, 'destroy']);

    // All invoice routes under /business prefix
    Route::prefix('invoices')->group(function () {
        Route::get('/{id}', [BusinessInvoiceController::class, 'show'])
            ->name('business.invoices.show');
        Route::get('/{invoice}/download', [BusinessInvoiceController::class, 'downloadPDF']);
        Route::post('/{invoice}/send', [BusinessInvoiceController::class, 'sendInvoice']);
        Route::post('/{invoice}/payments', [BusinessInvoiceController::class, 'recordPayment']);
        Route::put('/{invoice}/status', [BusinessInvoiceController::class, 'updateStatus']);
    });

    // Customer invoice routes
    Route::get('/customers/{customer}/invoices', [BusinessInvoiceController::class, 'getCustomerInvoices']);
    Route::get('/customers/{customer}/transactions', [BusinessInvoiceController::class, 'getCustomerTransactions']);
});
