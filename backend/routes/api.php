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
