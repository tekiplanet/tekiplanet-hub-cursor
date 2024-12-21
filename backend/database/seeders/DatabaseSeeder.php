<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            InstructorSeeder::class,
            CourseSeeder::class,
            CourseFeatureSeeder::class,
            SettingsSeeder::class,
            CourseReviewSeeder::class,
            CourseExamsSeeder::class,
            CourseModulesSeeder::class,
            CourseLessonsSeeder::class,
            CourseNoticesSeeder::class,
            CourseSchedulesSeeder::class,
            CourseTopicsSeeder::class,
            UserCourseNoticesSeeder::class,
            ServiceCategorySeeder::class,
            ServiceSeeder::class,
            ServiceQuoteFieldSeeder::class,
            QuoteMessagesSeeder::class,
            BusinessProfileSeeder::class,
            ProjectSeeder::class,
            ProjectStageSeeder::class,
            ProjectTeamMemberSeeder::class,
            ProjectFileSeeder::class,
            ProjectInvoiceSeeder::class,
            ProductCategorySeeder::class,
            BrandSeeder::class,
            ProductSeeder::class,
            ProductReviewSeeder::class,
            ShippingMethodSeeder::class,
            PromotionSeeder::class,
            ShippingZoneSeeder::class,
            ShippingMethodSeeder::class,
            ZoneShippingRateSeeder::class,
            CouponSeeder::class,
            ConsultingSettingsSeeder::class,
            ConsultingTimeSlotsSeeder::class,
            ProfessionalsTableSeeder::class,
            ConsultingBookingsSeeder::class,
            ConsultingReviewsSeeder::class,
            ConsultingNotificationsSeeder::class,
            WorkstationPlansSeeder::class,
            ProfessionalCategorySeeder::class,
            HustleSeeder::class,
            HustlePaymentSeeder::class,
        ]);
    }
}
