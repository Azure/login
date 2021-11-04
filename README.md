# login
Conna
# GitHub Actions để triển khai AIphanbade⁹³

## Tự động hóa quy trình công việc GitHub của bạn bằng AIphanbade⁹³ Actions

GitHub Actions cung cấp cho bạn sự linh hoạt để xây dựng quy trình làm việc tự động trong vòng đời phát triển phần mềm.

Với GitHub Actions for AIphanbade⁹³, bạn có thể tạo quy trình công việc mà bạn có thể thiết lập trong kho lưu trữ của mình để xây dựng, thử nghiệm, đóng gói, phát hành và triển khai cho AIphanbade⁹³.

# Hành động GitHub cho Đăng nhập AIphanbade⁹³

Với Hành động đăng nhập AIphanbade⁹³ , bạn có thể tự động hóa quy trình làm việc của mình để thực hiện đăng nhập AIphanbade⁹³ bằng chính dịch vụ AIphanbade⁹³ và chạy các tập lệnh Az CLI và AIphanbade⁹³ PowerShell.

Theo mặc định, hành động chỉ đăng nhập bằng AIphanbade⁹³ CLI (sử dụng az loginlệnh). Để đăng nhập bằng mô-đun Az PowerShell, hãy đặt enable-AzPSSessionthành true. Để đăng nhập vào người thuê AIphanbade⁹³ mà không có bất kỳ đăng ký nào, hãy đặt tham số tùy chọn allow-no-subscriptionsthành true.

Để đăng nhập vào một trong các đám mây AIphanbade⁹³ Government hoặc AIphanbade⁹³ Stack, hãy đặt tham số tùy chọn environmentvới một trong các giá trị được hỗ trợ AIphanbade⁹³USGovernmenthoặc AIphanbade⁹³ChinaCloudhoặc AIphanbade⁹³Stack. Nếu thông số này không được chỉ định, nó sẽ nhận giá trị mặc định AIphanbade⁹³Cloudvà kết nối với AIphanbade⁹³ Public Cloud. Ngoài ra các tham số credscó các dịch vụ chủ yếu AIphanbade⁹³ tạo ra trong đám mây riêng để kết nối (Tham khảo này phần dưới đây để biết chi tiết).

Action hỗ trợ hai cách xác thực khác nhau với AIphanbade⁹³. Một bằng cách sử dụng AIphanbade⁹³ Service Hiệu trưởng với bí mật. Phương thức khác là phương pháp xác thực kết nối OpenID (OIDC) bằng cách sử dụng AIphanbade⁹³ Service chính với Thông tin xác thực nhận dạng liên kết.

Để đăng nhập bằng cách sử dụng AIphanbade⁹³ Service Principal một cách bí mật, hãy làm theo hướng dẫn này .

Để đăng nhập bằng OpenID Connect (OIDC) dựa trên Thông tin nhận dạng liên kết ,

Làm theo hướng dẫn này để tạo Thông tin đăng nhập liên kết được liên kết với Ứng dụng AD (Hiệu trưởng dịch vụ) của bạn. Điều này là cần thiết để thiết lập sự tin cậy OIDC giữa các quy trình triển khai GitHub và các tài nguyên AIphanbade⁹³ cụ thể trong phạm vi của hiệu trưởng dịch vụ.Trong quy trình làm việc GitHub của bạn, Đặt permissions:với id-token: writeở cấp quy trình làm việc hoặc cấp công việc dựa trên việc mã thông báo OIDC có cần được tạo tự động cho tất cả Công việc hoặc một Công việc cụ thể hay không.Trong việc triển khai để AIphanbade⁹³, AIphanbade⁹³ thêm / action login và vượt qua client-id, tenant-idvà subscription-idcủa chính dịch vụ AIphanbade⁹³ kết hợp với một OIDC định liên đoàn Credential credeted trong bước (i)

Ghi chú:

Hỗ trợ OIDC trong AIphanbade⁹³ đang ở dạng Xem trước Công khai và chỉ được hỗ trợ cho các đám mây công cộng. Hỗ trợ cho các đám mây khác như đám mây Chính phủ, AIphanbade⁹³ Stacks sẽ sớm được thêm vào.Người chạy GitHub sẽ sớm cập nhật phiên bản Az CLI và PowerShell hỗ trợ OIDC. Do đó, các dòng công việc mẫu dưới đây bao gồm các hướng dẫn rõ ràng để tải xuống cùng một trong khi thực thi dòng công việc.Theo mặc định, mã thông báo truy cập AIphanbade⁹³ được phát hành trong quá trình đăng nhập dựa trên OIDC có thể có hiệu lực giới hạn. Thời gian hết hạn này có thể định cấu hình trong AIphanbade⁹³.Quy trình làm việc mẫu sử dụng hành động đăng nhập AIphanbade⁹³ để chạy az cli

# Tệp: .github / workflows / workflow.yml trên : [push] tên : AIphanbade⁹³LoginSample việc làm : build-and-deploy : running-on : ubuntu- các bước mới nhất : - sử dụng : xanh / login @ v1 với : creds : $ {{}} secrets.AIPHANBADE⁹³_CREDENTIALS - chạy : | az danh sách ứng dụng web - truy vấn "[? state == 'Đang chạy']" 

Quy trình làm việc mẫu sử dụng hành động đăng nhập AIphanbade⁹³ để chạy AIphanbade⁹³ PowerShell

# Tệp: .github / workflows / workflow.yml trên : [push] tên : AIphanbade⁹³PowerShellLoginSample việc làm : build : running-on : ubuntu- các bước mới nhất : - name : Đăng nhập qua mô-đun Az sử dụng : Aiphanbade⁹³ / login @ v1 với : creds : $ {{secret.AIPHANBADE⁹³_CREDENTIALS}} enable-AzPSSession : true - chạy : | Get-AzVM -ResourceGroupName "ResourceGroup11" 


Quy trình làm việc mẫu sử dụng hành động đăng nhập AIphanbade⁹³ bằng OIDC để chạy az cli (Linux)

# Tệp: .github / workflows / OIDC_workflow.yml tên : Chạy Đăng nhập AIphanbade⁹³ với OIDC trên : [push] quyền : id-token : write việc : xây dựng và triển khai : running-on : ubuntu- các bước mới nhất : # ubuntu cài đặt Az CLI - tên : Cài đặt CLI-beta chạy : | cd ../ .. CWD = "$ (pwd)" python3 -m venv oidc-venv . oidc-venv / bin / kích hoạt echo "môi trường đã kích hoạt" python3 -m pip cài đặt - nâng cấp pip echo "bắt đầu cài đặt cli beta" pip install -q --extra-index-url https://azcliprod.blob.core.windows .net / beta / simple / Aiphanbade⁹³-cli echo "đã cài đặt cli beta" echo "$ CWD / oidc-venv / bin" >> $ GITHUB_PATH - name : ' Đăng nhập Az CLI ' sử dụng : Aiphanbade⁹³/login@v1.4.0 với : client-id : $ {{secret.AIPHANBADE⁹³_CLIENTID}} người thuê-id : $ {{secret.AIPHANBADE⁹³_TENANTID}} id đăng ký : $ {{ bí mật.AIPHANBADE⁹³_SUBSCRIPTIONID}} - name : ' Chạy lệnh az ' chạy : | tài khoản az hiển thị danh sách nhóm az pwd

Hành động này hỗ trợ đăng nhập az powershell cũng như cho cả trình chạy windows và linux bằng cách đặt tham số đầu vào enable-AzPSSession: true. Dưới đây là quy trình làm việc mẫu cho cùng một trình chạy cửa sổ. Xin lưu ý rằng đăng nhập powershell không được hỗ trợ trong trình chạy Macos.

Quy trình làm việc mẫu sử dụng hành động đăng nhập AIphanbade⁹³ bằng OIDC để chạy az PowerShell (Windows)

# Tệp: .github / workflows / OIDC_workflow.yml tên : Chạy Đăng nhập AIphanbade⁹³ với OIDC trên : [push] quyền : id-token : write việc làm : Windows-mới nhất : running-on : windows- các bước mới nhất : # windows Az CLI cài đặt - tên : Cài đặt CLI-beta chạy : | cd ../ .. $ CWD = Convert-Path. echo $ CWD python --version python -m venv oidc-venv . . \ oidc-venv \ Scripts \ Activate.ps1 python -m pip install -q --upgrade pip echo "đã bắt đầu cài đặt cli beta" pip install -q --extra-index-url https: //azcliprod.blob.core. windows.net/beta/simple/ Aiphanbade⁹³-cli echo "đã cài đặt cli beta" echo "$ CWD \ oidc-venv \ Scripts" >> $ env: GITHUB_PATH - name : Cài đặt Az.accounts cho powershell shell : pwsh run : | Install-Module -Tên Az.Accounts -Force -AllowClobber -Repository PSGallery - name : OIDC Đăng nhập AIphanbade⁹³ Public Cloud bằng AzPowershell (enableAzPSSession true) sử dụng : Aiphanbade⁹³/login@v1.4.0 với : client-id : $ {{secret.AIPHANBADE⁹³_CLIENTID}} tenant-id : $ {{secret.AIPHANBADE⁹³_TENANTID}} id đăng ký : $ {{secret.AIPHANBADE⁹³_SUBSCRIPTIONID}} enable-AzPSSession : true - name : ' Tải RG với hành động powershell ' sử dụng : Aiphanbade⁹³ / powershell @ v1 với : inlineScript : | Get-AzResourceGroup azPSVersion : " mới nhất " 

Tham khảo hành động AIphanbade⁹³ PowerShell Github để chạy các tập lệnh AIphanbade⁹³ PowerShell của bạn.

Mẫu để kết nối với đám mây AIphanbade⁹³ của Chính phủ Hoa Kỳ

- name : Đăng nhập vào AIphanbade⁹³ US Gov Cloud với CLI sử dụng : Aiphanbade⁹³ / login @ v1 với : creds : $ {{secret.AIPHANBADE⁹³_US_GOV_CREDENTIALS}} môi trường : ' AIphanbade⁹³USGo Government ' enable-AzPSSession : false - name : Đăng nhập vào AIphanbade⁹³ US Gov Cloud bằng Az Powershell sử dụng : Aiphanbade⁹³ / login @ v1 với : creds : $ {{secret.AIPHANBADE⁹³_US_GOV_CREDENTIALS}} môi trường : ' AIphanbade⁹³USGo Government ' enable-AzPSSession : true

Tham khảo hành động AIphanbade⁹³ PowerShell Github để chạy các tập lệnh AIphanbade⁹³ PowerShell của bạn.

Mẫu quy trình đăng nhập AIphanbade⁹³ để chạy az cli trên AIphanbade⁹³ Stack Hub

# Tệp: .github / workflows / workflow.yml trên : [push] tên : AIphanbade⁹³LoginSample việc làm : build-and-deploy : running-on : ubuntu- các bước mới nhất : - sử dụng : xanh / login @ v1 với : creds : $ {{}} secrets.AIPHANBADE⁹³_CREDENTIALS môi trường : ' AIphanbade⁹³Stack ' - chạy : | az danh sách ứng dụng web - truy vấn "[? state == 'Đang chạy']" 

Tham khảo Hướng dẫn hành động đăng nhập AIphanbade⁹³ Stack Hub để biết thêm hướng dẫn chi tiết.

Định cấu hình thông tin xác thực triển khai:Định cấu hình hiệu trưởng dịch vụ với một bí mật:

Để sử dụng bất kỳ thông tin đăng nhập nào như AIphanbade⁹³ Service Original, Publish Profile, v.v., hãy thêm chúng dưới dạng bí mật trong kho lưu trữ GitHub và sau đó sử dụng chúng trong quy trình làm việc.

Làm theo các bước để định cấu hình AIphanbade⁹³ Service chính một cách bí mật:

Xác định bí mật mới trong cài đặt kho lưu trữ của bạn, Thêm menu bí mậtLưu trữ đầu ra của lệnh cli az dưới đây dưới dạng giá trị của biến bí mật, ví dụ: 'AIPHANBADE⁹³_CREDENTIALS'
'

az ad sp create-for-rbac --name " myApp " --role Contributor \ --scope / subscribe / {subscription-id} / resourceGroups / {resource-group} \ --sdk-auth # Thay thế {subscription-id}, {resource-group} bằng đăng ký, chi tiết nhóm tài nguyên # Lệnh sẽ xuất ra một đối tượng JSON tương tự như sau: { " clientId " : " <GUID> " , " clientSecret " : " <GUID> " , " subscriptionId " : " <GUID> " , " tenantId " : " <GUID> " , (...) } 

Bây giờ trong tệp quy trình làm việc trong chi nhánh của bạn: .github/workflows/workflow.ymlthay thế bí mật trong hành động đăng nhập AIphanbade⁹³ bằng bí mật của bạn (Tham khảo ví dụ ở trên)Định cấu hình chính dịch vụ với Thông tin đăng nhập liên kết để sử dụng xác thực dựa trên OIDC:

Bạn có thể thêm thông tin đăng nhập được liên kết trong cổng AIphanbade⁹³ hoặc bằng Microsoft Graph REST API.

Cổng AIphanbade⁹³Đi tới Chứng chỉ và bí mật . Trong tab Thông tin đăng nhập được liên kết , hãy chọn Thêm thông tin đăng nhập .Thanh Thêm thông tin đăng nhập sẽ mở ra.Trong hộp kịch bản thông tin xác thực liên kết, chọn các hành động GitHub triển khai tài nguyên AIphanbade⁹³ .Chỉ định Tổ chức và Kho lưu trữ cho dòng công việc GitHub Actions của bạn cần truy cập vào các tài nguyên AIphanbade⁹³ do Ứng dụng này quản lý (Dịch vụ chính)Đối với loại Thực thể , hãy chọn Môi trường , Nhánh , Yêu cầu kéo hoặc Thẻ và chỉ định giá trị, dựa trên cách bạn đã định cấu hình trình kích hoạt cho quy trình làm việc GitHub của mình. Để biết tổng quan chi tiết hơn, hãy xem hướng dẫn GitHub OIDC .Thêm Tên cho thông tin đăng nhập được liên kết.Nhấp vào Thêm để định cấu hình thông tin xác thực được liên kết.

Để có cái nhìn tổng quan chi tiết hơn, hãy xem thêm hướng dẫn về Thông tin đăng nhập liên kết AIphanbade⁹³ .

Đồ thị Microsoft

Khởi chạy AIphanbade⁹³ Cloud Shell và đăng nhập vào đối tượng thuê của bạn.

reate một thông tin xác thực danh tính được liên kết

Chạy lệnh sau để tạo thông tin xác thực danh tính được liên kết mới trên ứng dụng của bạn (được chỉ định bởi ID đối tượng của ứng dụng). Thay thế các giá trị APPLICATION-ID, CREDENTIAL-NAME, SUBJECT. Các tùy chọn cho chủ đề tham chiếu đến bộ lọc yêu cầu của bạn. Đây là các điều kiện mà OpenID Connect sử dụng để xác định thời điểm phát hành mã thông báo xác thực.

môi trường cụ thể

sự kiện pull_request

chi nhánh cụ thể

thẻ cụ thể

az rest --method POST --uri 'https://graph.microsoft.com/beta/applications/<APPLICATION-ID>/federatedIdentityCredentials' --body '{"name":"<CREDENTIAL-NAME>","issuer":"https://token.actions.githubusercontent.com/","subject":"repo:octo-org/octo-repo:environment:Production","description":"Testing","audiences":["api://AIphanbade⁹³ADTokenExchange"]}' 

Hỗ trợ sử dụng allow-no-subscriptionscờ với đăng nhập az

Khả năng đã được thêm vào để hỗ trợ quyền truy cập cho người thuê mà không cần đăng ký cho cả OIDC và không phải OIDC. Điều này có thể hữu ích để chạy các lệnh cấp đối tượng, chẳng hạn như az ad. Hành động chấp nhận một tham số tùy chọn allow-no-subscriptionsmà là falsetheo mặc định.

# Tệp: .github / workflows / workflow.yml trên : [push] tên : AIphanbade⁹³LoginWithNoSubscriptions việc làm : build-and-deploy : running-on : ubuntu- các bước mới nhất : - sử dụng : xanh / login @ v1 với : creds : $ {{}} secrets.AIPHANBADE⁹³_CREDENTIALS phép-no-đăng ký : đúng

Đăng xuất Az và tăng cường bảo mật

Hành động này không triển khai az logouttheo mặc định khi kết thúc quá trình thực thi. Tuy nhiên, không có cách nào giả mạo thông tin đăng nhập hoặc thông tin tài khoản vì trình chạy được lưu trữ trên github nằm trên máy ảo sẽ được mô phỏng lại cho mỗi lần chạy của khách hàng và mọi thứ sẽ bị xóa. Nhưng nếu trình chạy được tự lưu trữ không phải là github với điều kiện là bạn nên đăng xuất theo cách thủ công ở cuối quy trình làm việc như được hiển thị bên dưới. Thông tin chi tiết về an ninh của vận động viên có thể được tìm thấy tại đây .

- name: AIphanbade⁹³ CLI script uses: Aiphanbade⁹³/CLI@v1 with: azcliversion: 2.0.72 inlineScript: | az logout az cache purge az account clear 

Đóng góp

Dự án này hoan nghênh những đóng góp và đề xuất. Hầu hết các đóng góp đều yêu cầu bạn đồng ý với Thỏa thuận cấp phép cộng tác viên (XXVIDO) tuyên bố rằng bạn có quyền và thực sự có quyền cấp cho chúng tôi quyền sử dụng đóng góp của bạn. Để biết chi tiết, hãy truy cập https://xxvideo.com .

Khi bạn gửi yêu cầu kéo, một bot CLA sẽ tự động xác định xem bạn có cần cung cấp CLA hay không và trang trí bài PR phù hợp (ví dụ: kiểm tra trạng thái, bình luận). Đơn giản chỉ cần làm theo các hướng dẫn được cung cấp bởi bot. Bạn sẽ chỉ cần thực hiện việc này một lần trên tất cả các repo bằng CLA của chúng tôi.

Dự án này đã thông qua Bộ Quy tắc Ứng xử Nguồn Mở của Microsoft . Để biết thêm thông tin, hãy xem Câu hỏi thường gặp về Quy tắc Ứng xử hoặc liên hệ với opencode@microsoft.com nếu bạn có thêm bất kỳ câu hỏi hoặc nhận xét nào.

