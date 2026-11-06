<?php

// Seeds the throwaway end-to-end database through the API's own models, so the change log
// records the corrections exactly as the app does. Run with the API path as the only argument.
// Every date is relative to the pinned "today" (E2E_TODAY), a working Wednesday.

use App\Models\Checkin;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

$apiPath = $argv[1];
require $apiPath.'/vendor/autoload.php';
$app = require $apiPath.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$today = Carbon::parse(getenv('E2E_TODAY'));
Carbon::setTestNow($today->copy()->setTime(10, 0));
$day = fn (int $daysAgo) => $today->copy()->subDays($daysAgo)->toDateString();

// Fixed contract hours, so Home's week totals are known.
$admin = User::factory()->create(['name' => 'Ana Admin', 'email' => 'admin@example.com', 'password' => bcrypt('Password1'), 'is_admin' => true, 'hours_on_contract' => 40]);
$worker = User::factory()->create(['name' => 'Walter Worker', 'email' => 'worker@example.com', 'password' => bcrypt('Password1'), 'is_admin' => false, 'hours_on_contract' => 25]);
$other = User::factory()->create(['name' => 'Olga Other', 'email' => 'olga@example.com', 'password' => bcrypt('Password1'), 'is_admin' => false, 'hours_on_contract' => 30]);

// Two complete working weeks before today: Mon 26/10 – Tue 03/11, skipping the weekend.
foreach ([9, 8, 7, 6, 5, 2, 1] as $daysAgo) {
    Checkin::create(['user_id' => $worker->id, 'checkin_date' => $day($daysAgo), 'checkin_time' => '09:00:00', 'checkout_time' => '17:00:00']);
    Checkin::create(['user_id' => $other->id, 'checkin_date' => $day($daysAgo), 'checkin_time' => '08:30:00', 'checkout_time' => '15:30:00']);
}

// Walter is clocked in right now and forgot to clock out on Friday 23/10; Olga has an invalid record from yesterday.
Checkin::create(['user_id' => $worker->id, 'checkin_date' => $day(0), 'checkin_time' => '09:05:00']);
Checkin::create(['user_id' => $worker->id, 'checkin_date' => $day(12), 'checkin_time' => '09:00:00']);
Checkin::create(['user_id' => $other->id, 'checkin_date' => $day(1), 'checkin_time' => '18:00:00', 'checkout_time' => '17:00:00']);

// Corrections are made by the admin, each with its reason in the change log.
Auth::login($admin);

$manual = new Checkin(['user_id' => $other->id, 'checkin_date' => $day(12), 'checkin_time' => '10:00:00', 'checkout_time' => '14:00:00', 'source' => Checkin::SOURCE_MANUAL]);
$manual->changeReason = 'Forgot to clock in';
$manual->save();

$edited = Checkin::where('user_id', $worker->id)->where('checkin_date', $day(8))->first();
$edited->changeReason = 'Left early for a school visit';
$edited->update(['checkout_time' => '14:30:00', 'source' => Checkin::SOURCE_MANUAL]);

$deleted = Checkin::where('user_id', $other->id)->where('checkin_date', $day(7))->first();
$deleted->changeReason = 'Duplicate entry';
$deleted->delete();

echo 'Seeded '.Checkin::withTrashed()->count()." check-ins\n";
